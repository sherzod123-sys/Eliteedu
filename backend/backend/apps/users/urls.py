# apps/users/urls.py - TO'LIQ YANGILANGAN

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    leaderboard_view,
    user_search_view,          # ← YANGI
    RegisterView, UserLoginView, TeacherLoginView, StudentLoginView,
    ProfileView, LogoutView, UserViewSet,
    StudentProfileViewSet, TeacherProfileViewSet,
    AdminStudentListView, AdminTeacherListView
)

app_name = 'users'

router = DefaultRouter()
router.register(r'viewset-users', UserViewSet, basename='user')
router.register(r'student-profiles', StudentProfileViewSet, basename='student-profile')
router.register(r'teacher-profiles', TeacherProfileViewSet, basename='teacher-profile')

urlpatterns = [
    # AUTH
    path('auth/register/',      RegisterView.as_view(),     name='register'),
    path('auth/student-login/', StudentLoginView.as_view(), name='student-login'),
    path('auth/teacher-login/', TeacherLoginView.as_view(), name='teacher-login'),
    path('auth/login/',         UserLoginView.as_view(),    name='user-login'),
    path('auth/profile/',       ProfileView.as_view(),      name='profile'),
    path('auth/logout/',        LogoutView.as_view(),       name='logout'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),

    # LEADERBOARD
    path('leaderboard/', leaderboard_view, name='leaderboard'),

    # ← YANGI: FOYDALANUVCHI QIDIRISH
    path('search/', user_search_view, name='user-search'),

    # ADMIN
    path('admin/students/', AdminStudentListView.as_view(), name='admin-students-list'),
    path('admin/teachers/', AdminTeacherListView.as_view(), name='admin-teachers-list'),

    # ROUTER
    path('', include(router.urls)),
]