# apps/courses/urls.py — To‘g‘ri versiya

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet  # va agar boshqa viewsetlar bo‘lsa, ularni ham import qiling
from .views import CategoryViewSet

# Router yaratamiz
router = DefaultRouter()
router.register(r'', CourseViewSet, basename='course')  # Muhim: bo‘sh prefix ('')
router.register(r'categories', CategoryViewSet, basename='category')
# Agar kategoriyalar bo‘lsa, quyidagini ochib qo‘ying:
from .views import CategoryViewSet
router.register(r'categories', CategoryViewSet, basename='category')

urlpatterns = [
    path('', include(router.urls)),  # /api/courses/ → kurslar ro‘yxati
]