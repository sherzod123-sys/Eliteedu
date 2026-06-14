# config/middleware.py  (asgi.py bilan bir papkada)

from channels.middleware import BaseMiddleware
from channels.auth import AuthMiddlewareStack
from django.contrib.auth.models import AnonymousUser
from django.db import close_old_connections
from urllib.parse import parse_qs
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError


def get_user_from_token(token_key):
    """Token orqali userni sinxron olish"""
    from django.contrib.auth import get_user_model
    User = get_user_model()
    try:
        token = AccessToken(token_key)
        user_id = token['user_id']
        return User.objects.get(id=user_id)
    except (InvalidToken, TokenError, User.DoesNotExist, Exception):
        return AnonymousUser()


class JWTAuthMiddleware(BaseMiddleware):
    """
    WebSocket ulanishda ?token=... parametridan JWT token olib,
    foydalanuvchini scope['user'] ga qo'yadi.
    """
    async def __call__(self, scope, receive, send):
        close_old_connections()

        # Query string dan token olish: ws://.../?token=xxx
        query_string = scope.get('query_string', b'').decode()
        params = parse_qs(query_string)
        token_list = params.get('token', [])

        if token_list:
            token_key = token_list[0]
            from channels.db import database_sync_to_async
            scope['user'] = await database_sync_to_async(get_user_from_token)(token_key)
        else:
            scope['user'] = AnonymousUser()

        return await super().__call__(scope, receive, send)


def JWTAuthMiddlewareStack(inner):
    """AuthMiddlewareStack o'rniga ishlatish uchun"""
    return JWTAuthMiddleware(inner)