from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/notifications/', consumers.NotificationConsumer.as_asgi()),
    # ws/chat/ ni bu yerdan O'CHIRING — u chat/routing.py da bor
]