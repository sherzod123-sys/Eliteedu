# project/urls.py — TO'LIQ TUZATILGAN VERSIYA

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions
from django.views.generic import TemplateView
from .admin import admin_site

# Swagger schema
schema_view = get_schema_view(
    openapi.Info(
        title="EduPlatform API",
        default_version='v1',
        description="O'quv platformasi uchun to'liq REST API hujjatlari",
        terms_of_service="https://www.example.com/terms/",
        contact=openapi.Contact(email="support@eduplatform.uz"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    # Admin panel
    path('admin/', admin_site.urls),

    # JWT Authentication
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair_auth'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh_auth'),

    # API Documentation
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('swagger.json', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    

    # App API endpointlari
    path('api/users/', include('apps.users.urls')),
    path('api/', include('apps.courses.urls')),  # Courses app - prefiks o'chirildi
    path('api/orders/', include('apps.orders.urls')),
    path('api/blog/', include('apps.blog.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/chat/', include('apps.chat.urls')),
   

    # Frontend SPA (React build) - oxirida bo'lishi kerak
    path('', TemplateView.as_view(template_name='index.html'), name='home'),
]

# Catch-all route for SPA routing - eng oxirida
if not settings.DEBUG:
    # Production'da frontend route'lari uchun
    urlpatterns += [
        path('<path:path>', TemplateView.as_view(template_name='index.html')),
    ]

# Media va Static fayllar (Development)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    
    # Development'da frontend route'lari uchun
    urlpatterns += [
        path('<path:path>', TemplateView.as_view(template_name='index.html')),
    ]