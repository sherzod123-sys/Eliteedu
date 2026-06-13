# project/asgi.py
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')

# ✅ Django ni ASGI dan oldin setup qilish — bu muhim!
django.setup()

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator

# ✅ django.setup() dan KEYIN import qilish
from apps.notifications.routing import websocket_urlpatterns as notification_urlpatterns
from apps.chat.routing import websocket_urlpatterns as chat_urlpatterns
from apps.chat.middleware import JWTAuthMiddleware

django_asgi_app = get_asgi_application()

all_websocket_urlpatterns = notification_urlpatterns + chat_urlpatterns

application = ProtocolTypeRouter({
    'http': django_asgi_app,

    # ✅ TO'G'RI tartib:
    # AllowedHostsOriginValidator → JWTAuthMiddleware → URLRouter
    'websocket': AllowedHostsOriginValidator(
        JWTAuthMiddleware(
            URLRouter(all_websocket_urlpatterns)
        )
    ),
})