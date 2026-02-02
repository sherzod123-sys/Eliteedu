# apps/orders/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, PromoCodeViewSet

router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'promocodes', PromoCodeViewSet, basename='promocode')

urlpatterns = [
    path('', include(router.urls)),
]
