# apps/chat/models.py
from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.users.models import User


class ChatRoom(models.Model):
    participants = models.ManyToManyField(
        User, related_name='chat_rooms', verbose_name=_("Ishtirokchilar")
    )
    course = models.ForeignKey(
        'courses.Course', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='chat_rooms', verbose_name=_("Kurs")
    )
    # ✅ FIX: is_group maydoni qo'shildi (views.py va consumers.py da ishlatiladi)
    is_group = models.BooleanField(default=False, verbose_name=_("Guruh chat"))
    name = models.CharField(max_length=255, blank=True, verbose_name=_("Guruh nomi"))

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Chat xonasi")
        verbose_name_plural = _("Chat xonalari")
        ordering = ['-updated_at']

    def __str__(self):
        if self.is_group and self.name:
            return f"Guruh: {self.name}"
        return f"Chat {self.id} ({self.participants.count()} ishtirokchi)"

    @classmethod
    def get_or_create_direct(cls, user1, user2, course=None):
        """
        Ikki user o'rtasida to'g'ridan-to'g'ri (1-on-1) chat xonasini
        topadi yoki yaratadi. N+1 query muammosiz.
        """
        rooms = (
            cls.objects.filter(is_group=False, participants=user1)
            .filter(participants=user2)
            .annotate(cnt=models.Count('participants'))
            .filter(cnt=2)
        )
        if course:
            rooms = rooms.filter(course=course)

        existing = rooms.first()
        if existing:
            return existing, False

        room = cls.objects.create(course=course, is_group=False)
        room.participants.add(user1, user2)
        return room, True


class Message(models.Model):
    MESSAGE_TYPES = [
        ('text',  'Matn'),
        ('image', 'Rasm'),
        ('file',  'Fayl'),
        ('voice', 'Ovozli'),
        ('video', 'Video'),
    ]

    room    = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender  = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')

    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES, default='text')
    content      = models.TextField(blank=True)
    file         = models.FileField(upload_to='chat/files/%Y/%m/%d/', null=True, blank=True)
    file_name    = models.CharField(max_length=255, blank=True)
    duration     = models.PositiveIntegerField(default=0, help_text="Ovozli/video xabar davomiyligi (soniya)")

    reply_to       = models.ForeignKey(
        'self', on_delete=models.SET_NULL, null=True, blank=True, related_name='replies'
    )
    forwarded_from = models.ForeignKey(
        'self', on_delete=models.SET_NULL, null=True, blank=True, related_name='forwards'
    )
    # ✅ FIX: is_forwarded maydoni qo'shildi (consumers.py da ishlatiladi)
    is_forwarded = models.BooleanField(default=False)

    is_read    = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    is_edited  = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']
        verbose_name = _("Xabar")
        verbose_name_plural = _("Xabarlar")
        indexes = [
            # ✅ YANGI: tez-tez ishlatiladigan querylar uchun indekslar
            models.Index(fields=['room', 'created_at']),
            models.Index(fields=['room', 'is_read', 'is_deleted']),
            models.Index(fields=['sender']),
        ]

    def __str__(self):
        return f"{self.sender.username} [{self.message_type}] → Room {self.room_id}"

    def soft_delete(self):
        """Xabarni o'chirish (soft delete)"""
        self.is_deleted = True
        self.content = ''
        self.file = None
        self.save(update_fields=['is_deleted', 'content', 'file'])


class PinnedMessage(models.Model):
    MAX_PINS = 5

    room       = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='pinned_messages')
    message    = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='pins')
    pinned_by  = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    pinned_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('room', 'message')
        ordering = ['-pinned_at']
        verbose_name = _("Pinlangan xabar")
        verbose_name_plural = _("Pinlangan xabarlar")

    def __str__(self):
        return f"Pin: Room {self.room_id} → Msg {self.message_id}"


class MessageReaction(models.Model):
    message    = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='reactions')
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reactions')
    emoji      = models.CharField(max_length=10)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('message', 'user')
        verbose_name = _("Reaksiya")
        verbose_name_plural = _("Reaksiyalar")

    def __str__(self):
        return f"{self.user.username} {self.emoji} → Msg {self.message_id}"