# project/debug_middleware.py

import json
from django.utils.deprecation import MiddlewareMixin

class DebugAuthenticationMiddleware(MiddlewareMixin):
    """Blog endpoint'larini debug qilish uchun middleware"""
    
    def process_request(self, request):
        if request.path.startswith('/api/blog/') and 'reaction' in request.path:
            print("\n" + "="*100)
            print("🔥 DEBUG MIDDLEWARE - BLOG REACTION REQUEST")
            print("="*100)
            print(f"📌 Path: {request.path}")
            print(f"📌 Method: {request.method}")
            print(f"👤 User: {request.user}")
            print(f"🔐 Is authenticated: {request.user.is_authenticated}")
            print(f"🆔 User ID: {getattr(request.user, 'id', 'No ID')}")
            print(f"👥 Username: {getattr(request.user, 'username', 'Anonymous')}")
            
            # Session ma'lumotlari
            if hasattr(request, 'session'):
                print(f"💾 Session key: {request.session.session_key}")
                print(f"🗝️ Session exists in DB: {'sessionid' in request.COOKIES}")
            else:
                print("💾 No session object")
            
            # Headers
            auth_header = request.headers.get('Authorization', 'None')
            csrf_header = request.headers.get('X-CSRFToken', 'None')
            print(f"📨 Authorization header: {auth_header[:50] if auth_header != 'None' else 'None'}")
            print(f"🛡️ X-CSRFToken header: {'Exists' if csrf_header != 'None' else 'Missing'}")
            
            # Cookies
            cookies = dict(request.COOKIES)
            cookie_keys = list(cookies.keys())
            print(f"🍪 Cookie keys: {cookie_keys}")
            if 'sessionid' in cookies:
                print(f"🍪 Session ID length: {len(cookies['sessionid'])} chars")
            if 'csrftoken' in cookies:
                print(f"🍪 CSRF Token length: {len(cookies['csrftoken'])} chars")
            
            print("="*100 + "\n")
    
    def process_response(self, request, response):
        if request.path.startswith('/api/blog/') and 'reaction' in request.path:
            print(f"\n📤 DEBUG MIDDLEWARE - RESPONSE STATUS: {response.status_code}")
            if hasattr(response, 'data'):
                try:
                    print(f"📦 Response data type: {type(response.data)}")
                    if isinstance(response.data, dict):
                        print(f"📊 Response keys: {list(response.data.keys())}")
                except:
                    pass
        return response