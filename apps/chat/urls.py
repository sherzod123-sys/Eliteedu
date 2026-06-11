# apps/chat/urls.py
from django.urls import path
from .views import (
    ChatRoomListCreateView,
    ChatRoomDeleteView,
    MessageListView,
    MessageSendView,
    MessageDeleteView,
    MessageForwardView,
    PinMessageView,
    PinDeleteView,
    MessageReactionView,
    UnreadCountView,
    UpdateOnlineStatusView,
)

urlpatterns = [
    # Rooms
    path('rooms/', ChatRoomListCreateView.as_view(), name='room-list-create'),
    path('rooms/<int:room_id>/', ChatRoomDeleteView.as_view(), name='room-delete'),

    # Messages
    path('rooms/<int:room_id>/messages/', MessageListView.as_view(), name='message-list'),
    path('rooms/<int:room_id>/send/', MessageSendView.as_view(), name='message-send'),
    path('messages/<int:message_id>/', MessageDeleteView.as_view(), name='message-delete'),
    path('messages/<int:message_id>/forward/', MessageForwardView.as_view(), name='message-forward'),
    path('messages/<int:message_id>/react/', MessageReactionView.as_view(), name='message-react'),

    # Pin
    path('rooms/<int:room_id>/pin/', PinMessageView.as_view(), name='pin-list-create'),
    path('rooms/<int:room_id>/pin/<int:pin_id>/', PinDeleteView.as_view(), name='pin-delete'),

    # Utility
    path('unread/', UnreadCountView.as_view(), name='unread-count'),
    path('online/', UpdateOnlineStatusView.as_view(), name='update-online'),
]