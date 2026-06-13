# apps/chat/consumers.py
import base64
import json
import logging
import uuid
from io import BytesIO

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.core.files.base import ContentFile
from django.utils import timezone

from apps.notifications.models import Notification
from .models import ChatRoom, Message, MessageReaction, PinnedMessage
from .serializers import MessageSerializer, PinnedMessageSerializer

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────
# FakeRequest: WebSocket ichida URL building uchun
# ─────────────────────────────────────────────────────────────

class _FakeRequest:
    """
    ✅ FIX: Hardcoded 127.0.0.1 o'rniga settings dan olinadi.
    """
    def __init__(self):
        from django.conf import settings
        self._base = getattr(settings, 'SITE_URL', 'http://127.0.0.1:8000').rstrip('/')

    def build_absolute_uri(self, url: str) -> str:
        if url.startswith('http'):
            return url
        return f"{self._base}{url}"


_fake_request = _FakeRequest()


# ─────────────────────────────────────────────────────────────
# ChatConsumer
# ─────────────────────────────────────────────────────────────

class ChatConsumer(AsyncWebsocketConsumer):

    # ==================== Lifecycle ====================

    async def connect(self):
        self.room_id        = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'
        self.user           = self.scope.get('user')

        if not self.user or not self.user.is_authenticated:
            await self.close(code=4001)
            return

        if not await self.user_in_room():
            await self.close(code=4003)
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.channel_layer.group_add(f'user_{self.user.id}', self.channel_name)
        await self.accept()

        logger.info("[WS] %s connected → room %s", self.user, self.room_id)
        await self.broadcast_user_status(is_online=True)

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        if hasattr(self, 'user') and self.user and self.user.is_authenticated:
            await self.channel_layer.group_discard(f'user_{self.user.id}', self.channel_name)
            await self.broadcast_user_status(is_online=False)
            await self.update_last_seen()

    # ==================== Receive ====================

    async def receive(self, text_data):
        try:
            data   = json.loads(text_data)
            action = data.get('type')
            logger.debug("[WS] receive type=%s user=%s", action, self.user)

            handlers = {
                'text':    self.handle_text_message,
                'voice':   self.handle_voice_message,
                'react':   self.handle_reaction,
                'typing':  self.handle_typing,
                'delete':  self.handle_delete,
                'edit':    self.handle_edit,
                'pin':     self.handle_pin,
                'unpin':   self.handle_unpin,
                'forward': self.handle_forward,
                'read':    self.handle_read,
            }

            handler = handlers.get(action)
            if handler:
                await handler(data)
            else:
                await self.send_error(f"Noma'lum action: {action}")

        except json.JSONDecodeError:
            await self.send_error("JSON format noto'g'ri")
        except Exception as exc:
            logger.exception("[WS] receive error: %s", exc)
            await self.send_error("Ichki xatolik yuz berdi")

    # ==================== Message Handlers ====================

    async def handle_text_message(self, data):
        content = data.get('content', '').strip()
        if not content:
            await self.send_error("Xabar bo'sh bo'lishi mumkin emas")
            return

        message      = await self.save_message('text', content, data.get('reply_to_id'))
        message_data = await self.serialize_message(message.id)

        await self.channel_layer.group_send(
            self.room_group_name,
            {'type': 'chat_message', 'event': 'new_message', 'message': message_data},
        )

    async def handle_voice_message(self, data):
        audio_base64 = data.get('audio')
        duration     = data.get('duration', 0)

        if not audio_base64:
            await self.send_error("Audio data yo'q")
            return

        message = await self.save_voice_message(audio_base64, duration, data.get('reply_to_id'))
        if not message:
            await self.send_error("Ovozli xabarni saqlashda xato")
            return

        message_data = await self.serialize_message(message.id)
        await self.channel_layer.group_send(
            self.room_group_name,
            {'type': 'chat_message', 'event': 'new_message', 'message': message_data},
        )

    async def handle_reaction(self, data):
        message_id = data.get('message_id')
        emoji      = data.get('emoji', '').strip()

        if not message_id or not emoji:
            await self.send_error("message_id va emoji talab qilinadi")
            return

        await self.toggle_reaction(message_id, emoji)
        message_data = await self.serialize_message(message_id)

        await self.channel_layer.group_send(
            self.room_group_name,
            {'type': 'chat_message', 'event': 'reaction_updated', 'message': message_data},
        )

    async def handle_typing(self, data):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type':      'typing_indicator',
                'user_id':   self.user.id,
                'username':  getattr(self.user, 'full_name', None) or self.user.username,
                'is_typing': bool(data.get('is_typing', False)),
                'room_id':   int(self.room_id),
            },
        )

    async def handle_delete(self, data):
        message_id = data.get('message_id')
        if not message_id:
            await self.send_error("message_id talab qilinadi")
            return

        deleted = await self.delete_message(message_id)
        if not deleted:
            await self.send_error("Xabarni o'chirib bo'lmadi")
            return

        message_data = await self.serialize_message(message_id)
        await self.channel_layer.group_send(
            self.room_group_name,
            {'type': 'chat_message', 'event': 'message_deleted', 'message': message_data},
        )

    async def handle_edit(self, data):
        message_id  = data.get('message_id')
        new_content = data.get('content', '').strip()

        if not message_id or not new_content:
            await self.send_error("message_id va content talab qilinadi")
            return

        edited = await self.edit_message(message_id, new_content)
        if not edited:
            await self.send_error("Xabarni tahrirlashda xato")
            return

        message_data = await self.serialize_message(message_id)
        await self.channel_layer.group_send(
            self.room_group_name,
            {'type': 'chat_message', 'event': 'message_edited', 'message': message_data},
        )

    async def handle_pin(self, data):
        """✅ YANGI: to'liq implement qilindi"""
        message_id = data.get('message_id')
        if not message_id:
            await self.send_error("message_id talab qilinadi")
            return

        pin_data = await self.pin_message(message_id)
        if not pin_data:
            await self.send_error(f"Pin qo'yib bo'lmadi (limit: {PinnedMessage.MAX_PINS})")
            return

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type':    'pin_updated',
                'event':   'message_pinned',
                'pin':     pin_data,
                'room_id': int(self.room_id),
            },
        )

    async def handle_unpin(self, data):
        """✅ YANGI: to'liq implement qilindi"""
        pin_id = data.get('pin_id')
        if not pin_id:
            await self.send_error("pin_id talab qilinadi")
            return

        success = await self.unpin_message(pin_id)
        if not success:
            await self.send_error("Pin topilmadi")
            return

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type':    'pin_updated',
                'event':   'message_unpinned',
                'pin_id':  pin_id,
                'room_id': int(self.room_id),
            },
        )

    async def handle_forward(self, data):
        """✅ YANGI: to'liq implement qilindi"""
        message_id     = data.get('message_id')
        target_room_id = data.get('target_room_id')

        if not message_id or not target_room_id:
            await self.send_error("message_id va target_room_id talab qilinadi")
            return

        forwarded = await self.forward_message(message_id, target_room_id)
        if not forwarded:
            await self.send_error("Xabarni forward qilib bo'lmadi")
            return

        message_data = await self.serialize_message(forwarded.id)
        await self.channel_layer.group_send(
            f'chat_{target_room_id}',
            {'type': 'chat_message', 'event': 'new_message', 'message': message_data},
        )

    async def handle_read(self, data):
        await self.mark_messages_read()
        await self.channel_layer.group_send(
            self.room_group_name,
            {'type': 'messages_read', 'event': 'messages_read', 'user_id': self.user.id, 'room_id': int(self.room_id)},
        )

    # ==================== Event Receivers ====================

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type':    event.get('event', 'chat_message'),
            'message': event.get('message'),
        }))

    async def typing_indicator(self, event):
        await self.send(text_data=json.dumps(event))

    async def user_status(self, event):
        await self.send(text_data=json.dumps(event))

    async def pin_updated(self, event):
        await self.send(text_data=json.dumps(event))

    async def messages_read(self, event):
        await self.send(text_data=json.dumps(event))

    async def room_updated(self, event):
        await self.send(text_data=json.dumps({
            'type':       'room_updated',
            'event':      'room_list_updated',
            'room_id':    event.get('room_id'),
            'updated_at': event.get('updated_at'),
        }))

    # ==================== Helpers ====================

    async def send_error(self, message: str):
        await self.send(text_data=json.dumps({'type': 'error', 'message': message}))

    async def broadcast_user_status(self, is_online: bool):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type':      'user_status',
                'user_id':   self.user.id,
                'is_online': is_online,
                'last_seen': None if is_online else timezone.now().isoformat(),
            },
        )

    # ==================== DB Methods ====================

    @database_sync_to_async
    def user_in_room(self):
        return ChatRoom.objects.filter(id=self.room_id, participants=self.user).exists()

    @database_sync_to_async
    def update_last_seen(self):
        try:
            fields = []
            if hasattr(self.user, 'last_seen'):
                self.user.last_seen = timezone.now()
                fields.append('last_seen')
            if hasattr(self.user, 'is_online'):
                self.user.is_online = False
                fields.append('is_online')
            if fields:
                self.user.save(update_fields=fields)
        except Exception as exc:
            logger.error("update_last_seen error: %s", exc)

    @database_sync_to_async
    def serialize_message(self, message_id) -> dict:
        msg = (
            Message.objects
            .select_related('sender', 'reply_to__sender', 'forwarded_from__sender')
            .prefetch_related('reactions__user')
            .get(id=message_id)
        )
        return MessageSerializer(msg, context={'request': _fake_request}).data

    @database_sync_to_async
    def save_message(self, message_type: str, content: str, reply_to_id=None) -> Message:
        room     = ChatRoom.objects.get(id=self.room_id)
        reply_to = Message.objects.filter(id=reply_to_id, room=room).first() if reply_to_id else None
        message  = Message.objects.create(
            room=room, sender=self.user,
            message_type=message_type, content=content, reply_to=reply_to,
        )
        room.updated_at = message.created_at
        room.save(update_fields=['updated_at'])
        return message

    @database_sync_to_async
    def save_voice_message(self, audio_base64: str, duration: int, reply_to_id=None):
        try:
            # base64 formatini temizlash: "data:audio/webm;base64,..." → sadece data
            if ',' in audio_base64:
                audio_base64 = audio_base64.split(',', 1)[1]

            audio_data = base64.b64decode(audio_base64)
            file_name  = f"voice_{uuid.uuid4().hex}.webm"
            audio_file = ContentFile(audio_data, name=file_name)

            room     = ChatRoom.objects.get(id=self.room_id)
            reply_to = Message.objects.filter(id=reply_to_id, room=room).first() if reply_to_id else None

            message = Message.objects.create(
                room=room, sender=self.user,
                message_type='voice',
                file=audio_file,
                file_name=file_name,
                duration=int(duration) if str(duration).isdigit() else 0,
                reply_to=reply_to,
            )
            room.updated_at = message.created_at
            room.save(update_fields=['updated_at'])
            return message
        except Exception as exc:
            logger.error("save_voice_message error: %s", exc)
            return None

    @database_sync_to_async
    def toggle_reaction(self, message_id, emoji: str) -> str:
        try:
            message  = Message.objects.get(id=message_id, room_id=self.room_id)
            existing = MessageReaction.objects.filter(message=message, user=self.user).first()

            if existing:
                if existing.emoji == emoji:
                    existing.delete()
                    return 'removed'
                existing.emoji = emoji
                existing.save(update_fields=['emoji'])
                return 'changed'

            MessageReaction.objects.create(message=message, user=self.user, emoji=emoji)
            return 'added'
        except Message.DoesNotExist:
            return 'not_found'
        except Exception as exc:
            logger.error("toggle_reaction error: %s", exc)
            return 'error'

    @database_sync_to_async
    def delete_message(self, message_id) -> bool:
        try:
            message = Message.objects.get(id=message_id, sender=self.user, room_id=self.room_id)
            message.soft_delete()
            return True
        except Message.DoesNotExist:
            return False
        except Exception as exc:
            logger.error("delete_message error: %s", exc)
            return False

    @database_sync_to_async
    def edit_message(self, message_id, new_content: str) -> bool:
        try:
            message           = Message.objects.get(
                id=message_id, sender=self.user,
                room_id=self.room_id, message_type='text', is_deleted=False,
            )
            message.content   = new_content
            message.is_edited = True
            message.save(update_fields=['content', 'is_edited'])
            return True
        except Message.DoesNotExist:
            return False
        except Exception as exc:
            logger.error("edit_message error: %s", exc)
            return False

    @database_sync_to_async
    def pin_message(self, message_id):
        try:
            room    = ChatRoom.objects.get(id=self.room_id)
            message = Message.objects.get(id=message_id, room=room, is_deleted=False)

            if PinnedMessage.objects.filter(room=room).count() >= PinnedMessage.MAX_PINS:
                return None

            pinned, _ = PinnedMessage.objects.get_or_create(
                room=room, message=message,
                defaults={'pinned_by': self.user},
            )
            return PinnedMessageSerializer(pinned, context={'request': _fake_request}).data
        except Exception as exc:
            logger.error("pin_message error: %s", exc)
            return None

    @database_sync_to_async
    def unpin_message(self, pin_id) -> bool:
        try:
            PinnedMessage.objects.get(id=pin_id, room_id=self.room_id).delete()
            return True
        except PinnedMessage.DoesNotExist:
            return False
        except Exception as exc:
            logger.error("unpin_message error: %s", exc)
            return False

    @database_sync_to_async
    def forward_message(self, message_id, target_room_id):
        try:
            original    = Message.objects.get(id=message_id, is_deleted=False)
            target_room = ChatRoom.objects.get(id=target_room_id, participants=self.user)

            # Foydalanuvchi original xabar roomiga a'zo ekanini tekshirish
            if not original.room.participants.filter(id=self.user.id).exists():
                return None

            forwarded = Message.objects.create(
                room=target_room,
                sender=self.user,
                message_type=original.message_type,
                content=original.content,
                file=original.file,
                file_name=original.file_name,
                forwarded_from=original,
                is_forwarded=True,
                duration=original.duration,
            )
            target_room.updated_at = forwarded.created_at
            target_room.save(update_fields=['updated_at'])
            return forwarded
        except Exception as exc:
            logger.error("forward_message error: %s", exc)
            return None

    @database_sync_to_async
    def mark_messages_read(self):
        Message.objects.filter(
            room_id=self.room_id,
            is_read=False,
            is_deleted=False,
        ).exclude(sender=self.user).update(is_read=True)


# ─────────────────────────────────────────────────────────────
# NotificationConsumer
# ─────────────────────────────────────────────────────────────

class NotificationConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.user = self.scope.get('user')
        if not self.user or not self.user.is_authenticated:
            await self.close(code=4001)
            return

        self.group_name = f'notifications_{self.user.id}'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        count = await self.get_unread_count()
        await self.send(text_data=json.dumps({'type': 'unread_count', 'count': count}))

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        pass  # read-only consumer

    async def notify(self, event):
        await self.send(text_data=json.dumps(event['data']))

    @database_sync_to_async
    def get_unread_count(self) -> int:
        return Notification.objects.filter(user=self.user, is_read=False).count()