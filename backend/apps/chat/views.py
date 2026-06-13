# apps/chat/views.py
import logging

from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Count

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from .models import ChatRoom, Message, PinnedMessage, MessageReaction
from .serializers import (
    ChatRoomSerializer,
    MessageSerializer,
    PinnedMessageSerializer,
)

logger = logging.getLogger(__name__)


# ==================== Helpers ====================

def ws_send(group_name: str, payload: dict):
    """WebSocket orqali xabar yuborish uchun helper."""
    try:
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(group_name, payload)
        logger.debug("[WS] group_send → %s : %s", group_name, payload.get('event'))
    except Exception as exc:
        logger.error("[WS] group_send xato (%s): %s", group_name, exc)


def build_message_data(message: Message, request=None) -> dict:
    """MessageSerializer ni select_related bilan chaqirish."""
    msg = (
        Message.objects
        .select_related('sender', 'reply_to__sender', 'forwarded_from__sender')
        .prefetch_related('reactions__user')
        .get(id=message.id)
    )
    return MessageSerializer(msg, context={'request': request}).data


def parse_participant_ids(raw) -> list[int] | None:
    """
    participant_id / participant_ids maydonini turli formatlardan parse qiladi.
    Muvaffaqiyatli bo'lsa int listini qaytaradi, bo'lmasa None.
    """
    import json as _json

    if raw is None:
        return None

    # String bo'lsa JSON yoki CSV sifatida parse qilish
    if isinstance(raw, str):
        raw = raw.strip()
        if raw.startswith('['):
            try:
                raw = _json.loads(raw)
            except ValueError:
                return None
        else:
            try:
                raw = [int(x.strip()) for x in raw.split(',') if x.strip()]
            except ValueError:
                return None

    # Bitta raqam bo'lsa listga o'tkazish
    if isinstance(raw, (int, float)):
        raw = [raw]

    if not isinstance(raw, list):
        return None

    try:
        return [int(pid) for pid in raw if str(pid).strip()]
    except (ValueError, TypeError):
        return None


# ===================== ROOMS =====================

class ChatRoomListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        rooms = (
            ChatRoom.objects
            .filter(participants=request.user)
            .prefetch_related(
                'participants',
                'pinned_messages',
                'pinned_messages__message',
                'pinned_messages__message__sender',
                'pinned_messages__pinned_by',
            )
            .order_by('-updated_at')
        )
        return Response(
            ChatRoomSerializer(rooms, many=True, context={'request': request}).data
        )

    def post(self, request):
        """Yangi 1-on-1 yoki guruh chat yaratish."""
        raw = request.data.get('participant_ids') or request.data.get('participant_id')
        participant_ids = parse_participant_ids(raw)

        if participant_ids is None:
            return Response(
                {'error': 'participant_id yoki participant_ids talab qilinadi'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # O'zini ro'yxatdan chiqarish
        participant_ids = [pid for pid in participant_ids if pid != request.user.id]

        if not participant_ids:
            return Response(
                {'error': 'Kamida bitta boshqa foydalanuvchi kerak'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        course_id = request.data.get('course_id')

        # ── 1-on-1: mavjud chatni topish ──────────────────────────────
        if len(participant_ids) == 1:
            existing = (
                ChatRoom.objects
                .filter(is_group=False, participants=request.user)
                .filter(participants__id=participant_ids[0])
                .annotate(cnt=Count('participants'))
                .filter(cnt=2)
                .first()
            )
            if existing:
                logger.debug("Mavjud 1-on-1 chat qaytarildi: room_id=%s", existing.id)
                return Response(
                    ChatRoomSerializer(existing, context={'request': request}).data,
                    status=status.HTTP_200_OK,
                )

        # ── Yangi room yaratish ────────────────────────────────────────
        try:
            is_group = len(participant_ids) > 1
            room = ChatRoom.objects.create(
                course_id=course_id,
                is_group=is_group,
            )
            room.participants.add(request.user.id, *participant_ids)
            logger.info("Yangi chat yaratildi: room_id=%s is_group=%s", room.id, is_group)
            return Response(
                ChatRoomSerializer(room, context={'request': request}).data,
                status=status.HTTP_201_CREATED,
            )
        except Exception as exc:
            logger.exception("Room yaratishda xato: %s", exc)
            return Response({'error': 'Ichki xatolik'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ChatRoomDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, room_id):
        room = get_object_or_404(ChatRoom, id=room_id, participants=request.user)
        room.delete()
        return Response({'status': 'deleted', 'room_id': room_id})


# ===================== MESSAGES =====================

class MessageListView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request, room_id):
        room = get_object_or_404(ChatRoom, id=room_id, participants=request.user)

        updated = room.messages.exclude(
            sender=request.user
        ).filter(is_read=False).update(is_read=True)

        if updated:
            ws_send(
                f'chat_{room_id}',
                {
                    'type': 'messages_read',
                    'event': 'messages_read',
                    'user_id': request.user.id,
                    'room_id': room_id,
                }
            )

        messages = room.messages.select_related(
            'sender',
            'reply_to__sender',
            'forwarded_from__sender'
        ).prefetch_related(
            'reactions__user'
        ).order_by('created_at')

        return Response(
            MessageSerializer(
                messages,
                many=True,
                context={'request': request}
            ).data
        )

    def post(self, request, room_id):
        room = get_object_or_404(
            ChatRoom,
            id=room_id,
            participants=request.user
        )

        message_type = request.data.get('message_type', 'text')
        content = request.data.get('content', '')
        file = request.FILES.get('file')
        duration = request.data.get('duration', 0)
        reply_to_id = request.data.get('reply_to_id')

        reply_to = None
        if reply_to_id:
            reply_to = Message.objects.filter(
                id=reply_to_id,
                room=room
            ).first()

        message = Message.objects.create(
            room=room,
            sender=request.user,
            message_type=message_type,
            content=content,
            file=file,
            file_name=file.name if file else '',
            duration=int(duration) if str(duration).isdigit() else 0,
            reply_to=reply_to,
        )

        room.updated_at = timezone.now()
        room.save(update_fields=['updated_at'])

        message_data = MessageSerializer(
            message,
            context={'request': request}
        ).data

        ws_send(
            f'chat_{room_id}',
            {
                'type': 'chat_message',
                'event': 'new_message',
                'message': message_data,
            }
        )

        return Response(message_data, status=201)


class MessageSendView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request, room_id):
        room = get_object_or_404(ChatRoom, id=room_id, participants=request.user)

        message_type = request.data.get('message_type', 'text')
        content      = request.data.get('content', '').strip()
        file         = request.FILES.get('file')
        reply_to_id  = request.data.get('reply_to_id')
        duration     = request.data.get('duration', 0)

        # Validatsiya
        if message_type == 'text' and not content:
            return Response(
                {'error': "Matn bo'sh bo'lishi mumkin emas"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if message_type in ('voice', 'video', 'image', 'file') and not file:
            return Response(
                {'error': f'{message_type} uchun fayl talab qilinadi'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        reply_to = None
        if reply_to_id:
            reply_to = Message.objects.filter(id=reply_to_id, room=room).first()

        message = Message.objects.create(
            room=room,
            sender=request.user,
            message_type=message_type,
            content=content,
            file=file,
            file_name=file.name if file else '',
            reply_to=reply_to,
            duration=int(duration) if str(duration).isdigit() else 0,
        )

        room.updated_at = message.created_at
        room.save(update_fields=['updated_at'])

        message_data = build_message_data(message, request)

        ws_send(
            f'chat_{room_id}',
            {
                'type':    'chat_message',
                'event':   'new_message',
                'message': message_data,
            },
        )

        return Response(message_data, status=status.HTTP_201_CREATED)


class MessageEditView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, message_id):
        message = get_object_or_404(
            Message,
            id=message_id,
            sender=request.user,
            message_type='text',
            is_deleted=False,
        )
        new_content = request.data.get('content', '').strip()
        if not new_content:
            return Response(
                {'error': "content bo'sh bo'lishi mumkin emas"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        message.content   = new_content
        message.is_edited = True
        message.save(update_fields=['content', 'is_edited'])

        message_data = build_message_data(message, request)
        ws_send(
            f'chat_{message.room_id}',
            {'type': 'chat_message', 'event': 'message_edited', 'message': message_data},
        )
        return Response(message_data)


class MessageDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, message_id):
        message = get_object_or_404(Message, id=message_id, sender=request.user)
        message.soft_delete()  # ✅ model metodi ishlatildi

        message_data = build_message_data(message, request)
        ws_send(
            f'chat_{message.room_id}',
            {'type': 'chat_message', 'event': 'message_deleted', 'message': message_data},
        )
        return Response({'id': message.id, 'is_deleted': True})


# ===================== FORWARD =====================

class MessageForwardView(APIView):
    """
    ✅ FIX: Bu view endi to'g'ri ishlaydi — xabarni target_room_id ga forward qiladi.
    Oldingi versiyada yangi room yaratib qo'yardi (noto'g'ri edi).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, message_id):
        # Original xabarni topish (faqat a'zo bo'lgan roomlardagi xabarlar)
        message = get_object_or_404(
            Message,
            id=message_id,
            room__participants=request.user,
            is_deleted=False,
        )

        target_room_id = request.data.get('target_room_id')
        if not target_room_id:
            return Response(
                {'error': 'target_room_id talab qilinadi'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        target_room = get_object_or_404(ChatRoom, id=target_room_id, participants=request.user)

        forwarded = Message.objects.create(
            room=target_room,
            sender=request.user,
            message_type=message.message_type,
            content=message.content,
            file=message.file,
            file_name=message.file_name,
            forwarded_from=message,
            is_forwarded=True,
            duration=message.duration,
        )
        target_room.updated_at = forwarded.created_at
        target_room.save(update_fields=['updated_at'])

        message_data = build_message_data(forwarded, request)
        ws_send(
            f'chat_{target_room_id}',
            {'type': 'chat_message', 'event': 'new_message', 'message': message_data},
        )
        return Response(message_data, status=status.HTTP_201_CREATED)


# ===================== REACTIONS =====================

class MessageReactionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, message_id):
        message = get_object_or_404(
            Message,
            id=message_id,
            room__participants=request.user,
            is_deleted=False,
        )

        emoji = request.data.get('emoji', '').strip()
        if not emoji:
            return Response({'error': 'emoji talab qilinadi'}, status=status.HTTP_400_BAD_REQUEST)

        existing = MessageReaction.objects.filter(message=message, user=request.user).first()

        if existing and existing.emoji == emoji:
            existing.delete()
            action = 'removed'
        elif existing:
            existing.emoji = emoji
            existing.save(update_fields=['emoji'])
            action = 'changed'
        else:
            MessageReaction.objects.create(message=message, user=request.user, emoji=emoji)
            action = 'added'

        message_data = build_message_data(message, request)
        ws_send(
            f'chat_{message.room_id}',
            {'type': 'chat_message', 'event': 'reaction_updated', 'message': message_data},
        )
        return Response({
            'action':     action,
            'message_id': message.id,
            'reactions':  message_data.get('reactions', {}),
        })


# ===================== PIN =====================

class PinMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, room_id):
        room = get_object_or_404(ChatRoom, id=room_id, participants=request.user)
        pins = room.pinned_messages.select_related('message__sender', 'pinned_by')
        return Response(
            PinnedMessageSerializer(pins, many=True, context={'request': request}).data
        )

    def post(self, request, room_id):
        room    = get_object_or_404(ChatRoom, id=room_id, participants=request.user)
        message = get_object_or_404(
            Message, id=request.data.get('message_id'), room=room, is_deleted=False
        )

        if PinnedMessage.objects.filter(room=room).count() >= PinnedMessage.MAX_PINS:
            return Response(
                {'error': f'Maksimal {PinnedMessage.MAX_PINS} ta pin qo\'yish mumkin'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        pinned, created = PinnedMessage.objects.get_or_create(
            room=room, message=message,
            defaults={'pinned_by': request.user},
        )
        pin_data = PinnedMessageSerializer(pinned, context={'request': request}).data
        ws_send(
            f'chat_{room_id}',
            {'type': 'pin_updated', 'event': 'message_pinned', 'pin': pin_data, 'room_id': room_id},
        )
        return Response(pin_data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class PinDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, room_id, pin_id):
        pinned = get_object_or_404(
            PinnedMessage, id=pin_id, room_id=room_id, room__participants=request.user
        )
        pinned.delete()
        ws_send(
            f'chat_{room_id}',
            {'type': 'pin_updated', 'event': 'message_unpinned', 'pin_id': pin_id, 'room_id': room_id},
        )
        return Response({'status': 'unpinned', 'pin_id': pin_id})


# ===================== UTILITY =====================

class UnreadCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        ✅ FIX: N+1 query muammosi hal qilindi.
        Oldin har bir room uchun alohida query ketardi.
        Endi bitta aggregated query bilan.
        """
        from django.db.models import Count, Q

        rooms_qs = (
            ChatRoom.objects
            .filter(participants=request.user)
            .annotate(
                unread=Count(
                    'messages',
                    filter=Q(
                        messages__is_read=False,
                        messages__is_deleted=False,
                    ) & ~Q(messages__sender=request.user),
                )
            )
            .filter(unread__gt=0)
            .values('id', 'unread')
        )

        rooms       = {str(row['id']): row['unread'] for row in rooms_qs}
        total_unread = sum(rooms.values())

        return Response({'total_unread': total_unread, 'rooms': rooms})


class UpdateOnlineStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        is_online    = bool(request.data.get('is_online', True))
        user         = request.user
        update_fields = []

        if hasattr(user, 'is_online'):
            user.is_online = is_online
            update_fields.append('is_online')

        if hasattr(user, 'last_seen') and not is_online:
            user.last_seen = timezone.now()
            update_fields.append('last_seen')

        if update_fields:
            user.save(update_fields=update_fields)

        return Response({'status': 'ok', 'is_online': is_online})