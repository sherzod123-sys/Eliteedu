# apps/chat/middleware.py
import logging
from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser

logger = logging.getLogger(__name__)


@database_sync_to_async
def get_user_from_token(token: str):
    """
    JWT token orqali foydalanuvchini topish.
    rest_framework_simplejwt ishlatiladi.
    """
    try:
        from rest_framework_simplejwt.tokens import AccessToken
        from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
        from django.contrib.auth import get_user_model

        User = get_user_model()

        access_token = AccessToken(token)
        user_id = access_token.get('user_id')

        if not user_id:
            logger.warning("[JWT Middleware] token da user_id yo'q")
            return AnonymousUser()

        user = User.objects.get(id=user_id)
        logger.debug(f"[JWT Middleware] authenticated: {user}")
        return user

    except (TokenError, InvalidToken) as e:
        logger.warning(f"[JWT Middleware] token xato: {e}")
        return AnonymousUser()
    except Exception as e:
        logger.error(f"[JWT Middleware] kutilmagan xato: {e}")
        return AnonymousUser()


class JWTAuthMiddleware(BaseMiddleware):
    """
    WebSocket ulanishlar uchun JWT authentication middleware.

    Token quyidagi usullardan birida yuboriladi:
    1. Query param: ws://...?token=<jwt_token>
    2. Subprotocol: Sec-WebSocket-Protocol: <jwt_token>
    """

    async def __call__(self, scope, receive, send):
        token = None

        # ✅ 1-usul: query_string dan token olish
        query_string = scope.get('query_string', b'').decode()
        query_params = parse_qs(query_string)
        token_list = query_params.get('token', [])
        if token_list:
            token = token_list[0]
            logger.debug("[JWT Middleware] token query_string dan olindi")

        # ✅ 2-usul: subprotocol dan token olish
        if not token:
            subprotocols = scope.get('subprotocols', [])
            if subprotocols:
                token = subprotocols[0]
                logger.debug("[JWT Middleware] token subprotocol dan olindi")

        # ✅ 3-usul: headers dan Authorization: Bearer <token>
        if not token:
            headers = dict(scope.get('headers', []))
            auth_header = headers.get(b'authorization', b'').decode()
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ', 1)[1]
                logger.debug("[JWT Middleware] token Authorization headerdan olindi")

        if token:
            scope['user'] = await get_user_from_token(token)
        else:
            scope['user'] = AnonymousUser()
            logger.warning("[JWT Middleware] token topilmadi — AnonymousUser")

        return await super().__call__(scope, receive, send)