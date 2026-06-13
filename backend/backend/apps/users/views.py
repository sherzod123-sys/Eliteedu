# apps/users/views.py - REGISTER VIEW QO'SHILGAN

from rest_framework import viewsets, filters, status, generics, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Avg
from django.shortcuts import get_object_or_404
from django.utils.translation import gettext_lazy as _
import logging

from rest_framework import mixins 
from rest_framework.viewsets import GenericViewSet 

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import serializers 
from rest_framework import exceptions
from django.contrib.auth import authenticate
from rest_framework.permissions import BasePermission

logger = logging.getLogger(__name__)

from .models import User
from .serializers import (RegisterSerializer, UserProfileSerializer, 
                          StudentLoginSerializer, TeacherLoginSerializer) 

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import StudentProfile, TeacherProfile
from .serializers import (
    UserSerializer, UserDetailSerializer, StudentProfileSerializer,
    TeacherProfileSerializer, UserRegisterSerializer
)
from rest_framework.permissions import IsAdminUser

User = get_user_model()


# =============================================================================
# REGISTER VIEW - QO'SHILDI
# =============================================================================

class RegisterView(generics.GenericAPIView):
    """
    Talabalar uchun ro'yxatdan o'tish (phone bilan)
    """
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        logger.info(f"📝 Registration attempt")
        logger.info(f"📦 Request data: {request.data}")
        
        serializer = self.get_serializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
            
            # Token yaratish
            refresh = RefreshToken.for_user(user)
            
            response_data = {
                'message': 'Ro\'yxatdan o\'tish muvaffaqiyatli!',
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'phone': getattr(user, 'phone', ''),
                    'username': user.username,
                    'full_name': getattr(user, 'full_name', ''),
                    'role': user.role,
                    'email': user.email,
                }
            }
            
            logger.info(f"✅ User ro'yxatdan o'tdi: {user.username}")
            return Response(response_data, status=status.HTTP_201_CREATED)
            
        except serializers.ValidationError as e:
            logger.error(f"❌ Validation error: {e.detail}")
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"❌ Unexpected error: {str(e)}")
            return Response(
                {'error': 'Serverda xatolik yuz berdi'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ProfileView(generics.RetrieveUpdateAPIView):
    """
    User profili - GET va PUT/PATCH
    """
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class LogoutView(generics.GenericAPIView):
    """
    Logout - refresh token ni blacklist qilish
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
                return Response(
                    {'message': 'Muvaffaqiyatli chiqildi'}, 
                    status=status.HTTP_200_OK
                )
            return Response(
                {'error': 'Refresh token talab qilinadi'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Logout error: {str(e)}")
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )


# =============================================================================
# LOGIN SERIALIZERS
# =============================================================================

class PhoneLoginSerializer(serializers.Serializer):
    """
    Phone va password bilan login (Talabalar uchun)
    """
    phone = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    
    def validate(self, attrs):
        phone = attrs.get('phone')
        password = attrs.get('password')
        
        logger.info(f"🔐 Phone login: {phone}")
        
        try:
            user = User.objects.get(phone=phone)
            logger.info(f"✅ User topildi: {user.username} (role: {user.role})")
        except User.DoesNotExist:
            logger.error(f"❌ Phone topilmadi: {phone}")
            raise serializers.ValidationError(
                "Telefon raqam yoki parol noto'g'ri"
            )
        
        if not user.check_password(password):
            logger.error(f"❌ Noto'g'ri parol: {phone}")
            raise serializers.ValidationError(
                "Telefon raqam yoki parol noto'g'ri"
            )
        
        if not user.is_active:
            logger.error(f"❌ Faol emas: {phone}")
            raise serializers.ValidationError("Bu akkaunt faol emas")
        
        attrs['user'] = user
        return attrs


class UsernameLoginSerializer(serializers.Serializer):
    """
    Username va password bilan login (O'qituvchilar uchun)
    """
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        logger.info(f"🔐 Username login: {username}")
        
        try:
            user = User.objects.get(username=username)
            logger.info(f"✅ User topildi: {user.username} (role: {user.role})")
        except User.DoesNotExist:
            logger.error(f"❌ Username topilmadi: {username}")
            raise serializers.ValidationError(
                "Username yoki parol noto'g'ri"
            )
        
        if not user.check_password(password):
            logger.error(f"❌ Noto'g'ri parol: {username}")
            raise serializers.ValidationError(
                "Username yoki parol noto'g'ri"
            )
        
        if not user.is_active:
            logger.error(f"❌ Faol emas: {username}")
            raise serializers.ValidationError("Bu akkaunt faol emas")
        
        attrs['user'] = user
        return attrs


# =============================================================================
# LOGIN VIEWS
# =============================================================================

class TeacherLoginView(generics.GenericAPIView):
    """
    O'qituvchilar uchun - USERNAME bilan login
    """
    serializer_class = UsernameLoginSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        logger.info(f"👨‍🏫 Teacher login attempt")
        logger.info(f"📦 Request data: {request.data}")
        
        serializer = self.get_serializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
            user = serializer.validated_data['user']
            
            # Teacher ekanligini tekshirish
            if user.role not in ['teacher', 'admin']:
                logger.warning(f"⚠️ Non-teacher: {user.username} (role: {user.role})")
                return Response(
                    {'error': 'Bu endpoint faqat o\'qituvchilar uchun!'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Token yaratish
            refresh = RefreshToken.for_user(user)
            
            response_data = {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'phone': getattr(user, 'phone', ''),
                    'full_name': getattr(user, 'full_name', ''),
                    'role': user.role,
                    'email': user.email,
                }
            }
            
            logger.info(f"✅ Teacher kirdi: {user.username}")
            return Response(response_data, status=status.HTTP_200_OK)
            
        except serializers.ValidationError as e:
            logger.error(f"❌ Validation error: {e.detail}")
            error_message = e.detail
            if isinstance(error_message, dict):
                error_message = list(error_message.values())[0]
                if isinstance(error_message, list):
                    error_message = error_message[0]
            elif isinstance(error_message, list):
                error_message = error_message[0]
            
            return Response(
                {'error': str(error_message)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"❌ Unexpected error: {str(e)}")
            return Response(
                {'error': 'Serverda xatolik yuz berdi'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class StudentLoginView(generics.GenericAPIView):
    """
    Talabalar uchun - PHONE bilan login
    """
    serializer_class = PhoneLoginSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        logger.info(f"👨‍🎓 Student login attempt")
        logger.info(f"📦 Request data: {request.data}")
        
        serializer = self.get_serializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
            user = serializer.validated_data['user']
            
            # Token yaratish
            refresh = RefreshToken.for_user(user)
            
            response_data = {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'phone': user.phone,
                    'username': user.username,
                    'full_name': getattr(user, 'full_name', ''),
                    'role': user.role,
                    'email': user.email,
                }
            }
            
            logger.info(f"✅ Student kirdi: {user.phone}")
            return Response(response_data, status=status.HTTP_200_OK)
            
        except serializers.ValidationError as e:
            logger.error(f"❌ Validation error: {e.detail}")
            error_message = e.detail
            if isinstance(error_message, dict):
                error_message = list(error_message.values())[0]
                if isinstance(error_message, list):
                    error_message = error_message[0]
            elif isinstance(error_message, list):
                error_message = error_message[0]
            
            return Response(
                {'error': str(error_message)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"❌ Unexpected error: {str(e)}")
            return Response(
                {'error': 'Serverda xatolik yuz berdi'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserLoginView(generics.GenericAPIView):
    """
    Umumiy login - phone yoki username
    """
    serializer_class = PhoneLoginSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        logger.info(f"📱 General login attempt")
        
        # Avval phone bilan urinish
        phone_serializer = PhoneLoginSerializer(data=request.data)
        if phone_serializer.is_valid():
            user = phone_serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'phone': getattr(user, 'phone', ''),
                    'username': user.username,
                    'full_name': getattr(user, 'full_name', ''),
                    'role': user.role,
                    'email': user.email,
                }
            }, status=status.HTTP_200_OK)
        
        # Agar phone bilan topilmasa, username bilan urinish
        username_data = {
            'username': request.data.get('phone') or request.data.get('username'),
            'password': request.data.get('password')
        }
        username_serializer = UsernameLoginSerializer(data=username_data)
        
        try:
            username_serializer.is_valid(raise_exception=True)
            user = username_serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'phone': getattr(user, 'phone', ''),
                    'username': user.username,
                    'full_name': getattr(user, 'full_name', ''),
                    'role': user.role,
                    'email': user.email,
                }
            }, status=status.HTTP_200_OK)
        except:
            return Response(
                {'error': 'Login yoki parol noto\'g\'ri'},
                status=status.HTTP_400_BAD_REQUEST
            )


# =============================================================================
# QOLGAN VIEWSET'LAR
# =============================================================================

class AuthViewSet(mixins.CreateModelMixin, mixins.RetrieveModelMixin, GenericViewSet):
    queryset = User.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'register':
            return RegisterSerializer
        return UserProfileSerializer

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            'message': _('Muvaffaqiyatli ro\'yxatdan o\'tdingiz!'), 
            'user_id': user.id
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get', 'put', 'patch'], permission_classes=[IsAuthenticated])
    def me(self, request):
        if request.method == 'GET':
            serializer = UserProfileSerializer(request.user)
            return Response(serializer.data)
        
        if request.method in ['PUT', 'PATCH']:
            serializer = UserProfileSerializer(
                request.user, 
                data=request.data, 
                partial=(request.method == 'PATCH')
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]


class AdminStudentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if not self.request.user.is_staff:
            return User.objects.none()
        return User.objects.filter(role='student')


class StudentProfileViewSet(viewsets.ModelViewSet):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return User.objects.filter(id=self.request.user.id)
    
    def perform_update(self, serializer):
        serializer.save()

class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user == obj or request.user.role == 'admin'


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_serializer_class(self):
        if self.action in ['retrieve', 'update', 'partial_update']:
            return UserDetailSerializer
        if self.action == 'register':
            return UserRegisterSerializer
        return UserSerializer

    def get_permissions(self):
        if self.action in ['list', 'destroy']:
            permission_classes = [permissions.IsAdminUser]
        elif self.action in ['retrieve', 'update', 'partial_update']:
            permission_classes = [IsOwnerOrAdmin]
        else:
            permission_classes = [permissions.AllowAny]
        return [perm() for perm in permission_classes]

    @action(detail=False, methods=['post'])
    def register(self, request):
        """Yangi talaba ro'yxatdan o'tkazish"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        """Joriy foydalanuvchi profili"""
        serializer = UserDetailSerializer(request.user, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def change_role(self, request, pk=None):
        """Admin tomonidan rol o'zgartirish"""
        user = self.get_object()
        new_role = request.data.get('role')
        if new_role not in dict(User.ROLE_CHOICES):
            return Response({'error': 'Noto\'g\'ri rol'}, status=status.HTTP_400_BAD_REQUEST)
        user.role = new_role
        user.save()
        return Response({'message': f'Rol {new_role} ga o\'zgartirildi'})


class StudentProfileViewSet(viewsets.ModelViewSet):
    queryset = StudentProfile.objects.all()
    serializer_class = StudentProfileSerializer
    permission_classes = [IsOwnerOrAdmin]

    def get_queryset(self):
        if self.request.user.role == 'admin':
            return StudentProfile.objects.all()
        return StudentProfile.objects.filter(user=self.request.user)


class TeacherProfileViewSet(viewsets.ModelViewSet):
    queryset = TeacherProfile.objects.all()
    serializer_class = TeacherProfileSerializer
    permission_classes = [IsOwnerOrAdmin]

    def get_queryset(self):
        if self.request.user.role == 'admin':
            return TeacherProfile.objects.all()
        return TeacherProfile.objects.filter(user=self.request.user)

class AdminUserViewSet(viewsets.ModelViewSet):
    """Admin uchun foydalanuvchilarni to'liq boshqarish"""
    queryset = User.objects.all().select_related('student_profile', 'teacher_profile')
    permission_classes = [IsAdminUser]

    def get_serializer_class(self):
        if self.action == 'create':
            return AdminUserCreateSerializer
        return AdminUserUpdateSerializer

    @action(detail=True, methods=['post'])
    def add_points(self, request, pk=None):
        """Ball qo'shish"""
        user = self.get_object()
        points = request.data.get('points', 0)
        if points <= 0:
            return Response({'error': 'Ball musbat bo\'lishi kerak'}, status=status.HTTP_400_BAD_REQUEST)
        user.points += points
        user.save()
        return Response({'message': f'{points} ball qo\'shildi', 'total_points': user.points})

    @action(detail=True, methods=['post'])
    def add_badge(self, request, pk=None):
        """Badge qo'shish"""
        user = self.get_object()
        badge = request.data.get('badge')
        if not badge:
            return Response({'error': 'Badge nomi kiritilmadi'}, status=status.HTTP_400_BAD_REQUEST)
        if badge not in user.badges:
            user.badges.append(badge)
            user.save()
        return Response({'message': f'"{badge}" badge qo\'shildi', 'badges': user.badges})

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """Foydalanuvchini tasdiqlash"""
        user = self.get_object()
        user.is_verified = True
        user.save()
        return Response({'message': 'Foydalanuvchi tasdiqlandi'})


class AdminStudentListView(generics.ListAPIView):
    """Admin uchun talabalar ro'yxati"""
    queryset = User.objects.filter(role='student').select_related('student_profile')
    serializer_class = UserProfileSerializer
    permission_classes = [IsAdminUser]


class AdminTeacherListView(generics.ListAPIView):
    """Admin uchun o'qituvchilar ro'yxati"""
    queryset = User.objects.filter(role__in=['teacher', 'admin']).select_related('teacher_profile')
    serializer_class = UserProfileSerializer
    permission_classes = [IsAdminUser]            

class IsTeacherOrAdmin(BasePermission):
    """Faqat o'qituvchi yoki adminlarga ruxsat berish"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.role in ['teacher', 'admin'] or request.user.is_staff
        )

class TeacherStudentListViewSet(viewsets.ReadOnlyModelViewSet):
    """
    O'qituvchilar uchun barcha talabalar ro'yxatini chiqaruvchi API
    URL: /api/users/students_list/
    """
    serializer_class = UserProfileSerializer # yoki UserSerializer
    permission_classes = [IsTeacherOrAdmin]

    def get_queryset(self):
        # Faqat 'student' rolidagi foydalanuvchilarni qaytaradi
        return User.objects.filter(role='student').order_by('-date_joined')
    