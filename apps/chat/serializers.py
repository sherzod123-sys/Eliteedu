# apps/chat/serializers.py
from rest_framework import serializers
from .models import ChatRoom, Message, PinnedMessage, MessageReaction
from apps.users.models import User


class UserShortSerializer(serializers.ModelSerializer):
    avatar    = serializers.SerializerMethodField()
    is_online = serializers.SerializerMethodField()
    last_seen = serializers.SerializerMethodField()

    class Meta:
        model  = User
        fields = ['id', 'username', 'full_name', 'role', 'avatar', 'is_online', 'last_seen']

    def get_avatar(self, obj):
        request = self.context.get('request')
        if hasattr(obj, 'avatar') and obj.avatar:
            try:
                url = obj.avatar.url
                return request.build_absolute_uri(url) if request else url
            except Exception:
                return None
        return None

    def get_is_online(self, obj):
        return getattr(obj, 'is_online', False)

    def get_last_seen(self, obj):
        val = getattr(obj, 'last_seen', None)
        return val.isoformat() if val else None


class ReplyMessageSerializer(serializers.ModelSerializer):
    sender = UserShortSerializer(read_only=True)

    class Meta:
        model  = Message
        fields = ['id', 'sender', 'content', 'message_type', 'file_name', 'is_deleted']


class ForwardedFromSerializer(serializers.ModelSerializer):
    sender = UserShortSerializer(read_only=True)

    class Meta:
        model  = Message
        fields = ['id', 'sender', 'content', 'message_type', 'file_name', 'is_deleted']


class MessageSerializer(serializers.ModelSerializer):
    sender         = UserShortSerializer(read_only=True)
    file           = serializers.SerializerMethodField()
    reply_to       = ReplyMessageSerializer(read_only=True)
    forwarded_from = ForwardedFromSerializer(read_only=True)
    reactions      = serializers.SerializerMethodField()
    is_edited      = serializers.BooleanField(read_only=True)
    is_forwarded   = serializers.BooleanField(read_only=True)

    class Meta:
        model  = Message
        fields = [
            'id', 'room', 'sender', 'message_type', 'content',
            'file', 'file_name', 'duration',
            'reply_to', 'forwarded_from', 'is_forwarded',
            'is_deleted', 'is_edited', 'is_read', 'created_at',
            'reactions',
        ]
        read_only_fields = ['sender', 'created_at', 'is_read', 'is_deleted', 'is_edited', 'is_forwarded']

    def get_file(self, obj):
        if obj.is_deleted or not obj.file:
            return None
        request = self.context.get('request')
        try:
            return request.build_absolute_uri(obj.file.url) if request else obj.file.url
        except Exception:
            return None

    def get_reactions(self, obj):
        """Emoji reaksiyalarni guruhlangan formatda qaytarish"""
        result = {}
        for r in obj.reactions.all():
            entry = result.setdefault(r.emoji, {'count': 0, 'users': []})
            entry['count'] += 1
            entry['users'].append({
                'id': r.user_id,
                'full_name': getattr(r.user, 'full_name', None) or r.user.username,
            })
        return result


class PinnedMessageSerializer(serializers.ModelSerializer):
    pinned_by    = serializers.SerializerMethodField()
    message_id   = serializers.IntegerField(source='message.id', read_only=True)
    content      = serializers.CharField(source='message.content', read_only=True)
    message_type = serializers.CharField(source='message.message_type', read_only=True)
    file_name    = serializers.CharField(source='message.file_name', read_only=True)
    duration     = serializers.IntegerField(source='message.duration', read_only=True)
    sender       = serializers.SerializerMethodField()

    class Meta:
        model  = PinnedMessage
        fields = [
            'id', 'message_id', 'content', 'message_type',
            'file_name', 'duration', 'pinned_by', 'pinned_at', 'sender',
        ]

    def get_pinned_by(self, obj):
        if obj.pinned_by:
            return getattr(obj.pinned_by, 'full_name', None) or obj.pinned_by.username
        return None

    def get_sender(self, obj):
        sender  = obj.message.sender
        request = self.context.get('request')
        avatar  = None
        if hasattr(sender, 'avatar') and sender.avatar:
            try:
                avatar = request.build_absolute_uri(sender.avatar.url) if request else sender.avatar.url
            except Exception:
                pass
        return {
            'id':        sender.id,
            'full_name': getattr(sender, 'full_name', None) or sender.username,
            'avatar':    avatar,
        }


class ChatRoomSerializer(serializers.ModelSerializer):
    participants    = UserShortSerializer(many=True, read_only=True)
    last_message    = serializers.SerializerMethodField()
    unread_count    = serializers.SerializerMethodField()
    pinned_messages = serializers.SerializerMethodField()
    other_user      = serializers.SerializerMethodField()

    class Meta:
        model  = ChatRoom
        fields = [
            'id', 'is_group', 'name', 'participants', 'other_user',
            'course', 'last_message', 'unread_count',
            'pinned_messages', 'created_at', 'updated_at',
        ]

    def get_other_user(self, obj):
        """
        1-on-1 chatlarda ikkinchi foydalanuvchini qaytaradi.
        Frontendga qulay shortcut.
        """
        request = self.context.get('request')
        if not request or obj.is_group:
            return None
        other = obj.participants.exclude(id=request.user.id).first()
        if other:
            return UserShortSerializer(other, context=self.context).data
        return None

    def get_last_message(self, obj):
        last = obj.messages.select_related('sender').last()
        if not last:
            return None

        if last.is_deleted:
            content = "Xabar o'chirildi"
        elif last.message_type == 'voice':
            content = '🎤 Ovozli xabar'
        elif last.message_type == 'video':
            content = '📹 Video xabar'
        elif last.message_type == 'image':
            content = '🖼 Rasm'
        elif last.message_type != 'text':
            content = f'📎 {last.file_name or "Fayl"}'
        else:
            content = last.content

        request      = self.context.get('request')
        sender_avatar = None
        if hasattr(last.sender, 'avatar') and last.sender.avatar:
            try:
                sender_avatar = request.build_absolute_uri(last.sender.avatar.url) if request else last.sender.avatar.url
            except Exception:
                pass

        return {
            'id':           last.id,
            'content':      content,
            'message_type': last.message_type,
            'is_deleted':   last.is_deleted,
            'is_read':      last.is_read,
            'created_at':   last.created_at.isoformat() if last.created_at else None,
            'sender': {
                'id':        last.sender.id,
                'full_name': getattr(last.sender, 'full_name', None) or last.sender.username,
                'avatar':    sender_avatar,
            },
        }

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if not request:
            return 0
        return obj.messages.filter(
            is_read=False, is_deleted=False
        ).exclude(sender=request.user).count()

    def get_pinned_messages(self, obj):
        pins = PinnedMessage.objects.filter(room=obj).select_related(
            'message', 'message__sender', 'pinned_by'
        ).order_by('-pinned_at')[:PinnedMessage.MAX_PINS]
        return PinnedMessageSerializer(pins, many=True, context=self.context).data