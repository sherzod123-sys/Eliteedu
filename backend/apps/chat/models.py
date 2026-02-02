# apps/chat/models.py
from django.db import models
from django.conf import settings

class Conversation(models.Model):
    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL, 
        related_name='chat_conversations'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)  # Oxirgi xabar vaqti

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        users = ", ".join([u.full_name or u.username for u in self.participants.all()[:2]])
        return f"Chat: {users}"

class Message(models.Model):
    conversation = models.ForeignKey(
        Conversation, 
        on_delete=models.CASCADE, 
        related_name='messages'
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='sent_messages'
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.sender.full_name or self.sender.username}: {self.content[:30]}..."
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Conversation updated_at yangilash
        self.conversation.updated_at = self.created_at
        self.conversation.save()