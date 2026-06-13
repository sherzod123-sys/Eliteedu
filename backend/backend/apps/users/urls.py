# apps/users/urls.py - TO'G'RILANGAN

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView, UserLoginView, TeacherLoginView, StudentLoginView,
    ProfileView, LogoutView, AuthViewSet, UserViewSet, 
    AdminStudentViewSet, StudentProfileViewSet, TeacherProfileViewSet,
    AdminStudentListView, AdminTeacherListView
)

app_name = 'users'

# Router yaratish
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'student-profiles', StudentProfileViewSet, basename='student-profile')
router.register(r'teacher-profiles', TeacherProfileViewSet, basename='teacher-profile')

# URL patterns
urlpatterns = [
    # ===== AUTHENTICATION ENDPOINTS =====
    # Barcha auth endpoint'lari 'auth/' prefix bilan
    
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', UserLoginView.as_view(), name='user-login'),
    path('auth/teacher-login/', TeacherLoginView.as_view(), name='teacher-login'),
    path('auth/student-login/', StudentLoginView.as_view(), name='student-login'),
    path('auth/profile/', ProfileView.as_view(), name='profile'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    
    # ===== ADMIN ENDPOINTS =====
    path('admin/students/', AdminStudentListView.as_view(), name='admin-students-list'),
    path('admin/teachers/', AdminTeacherListView.as_view(), name='admin-teachers-list'),
    
    # Admin student management
    path('', include(router.urls)),
]

# Natijada endpoint'lar:
# POST /api/users/auth/register/
# POST /api/users/auth/login/
# POST /api/users/auth/teacher-login/  ← SHU
# POST /api/users/auth/student-login/
# GET  /api/users/auth/profile/
# POST /api/users/auth/logout/
# POST /api/users/auth/token/refresh/
# GET  /api/users/admin/students/
# GET  /api/users/admin/teachers/
# GET  /api/users/users/
# GET  /api/users/student-profiles/
# GET  /api/users/teacher-profiles/