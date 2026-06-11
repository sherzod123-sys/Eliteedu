# apps/chat/admin.py
from django.contrib import admin
from .models import Conversation, Message

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['id', 'get_participants', 'created_at', 'updated_at']
    filter_horizontal = ['participants']
    
    def get_participants(self, obj):
        return ", ".join([u.full_name or u.username for u in obj.participants.all()])
    get_participants.short_description = 'Ishtirokchilar'

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'sender', 'get_content', 'conversation', 'created_at', 'is_read']
    list_filter = ['is_read', 'created_at']
    search_fields = ['content', 'sender__full_name', 'sender__username']
    
    def get_content(self, obj):
        return obj.content[:50] + ('...' if len(obj.content) > 50 else '')
    get_content.short_description = 'Xabar'