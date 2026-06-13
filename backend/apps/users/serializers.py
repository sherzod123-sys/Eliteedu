# /apps/users/serializers.py

from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from .models import User, StudentProfile, TeacherProfile, ROLE_CHOICES
from django.utils.translation import gettext_lazy as _


# --- I. Asosiy Model Serializerlar ---

class UserSerializer(serializers.ModelSerializer):
    """ Foydalanuvchi profilini ko'rish va tahrirlash uchun asosiy serializer """
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'phone', 'full_name', 'father_name', 'birth_date',
            'region', 'district', 'address', 'parent_phone', 'parent_name',
            'avatar', 'bio', 'telegram_username', 'role', 'points', 'badges',
            'is_verified', 'created_at', 'group_name', 'class_room'
        ]
        read_only_fields = ['id', 'points', 'badges', 'created_at', 'username']


class UserProfileSerializer(UserSerializer):
    """ 'me' (profil) uchun serializer. Asosan UserSerializer bilan bir xil,
        lekin nomini views.py dan to'g'ri import qilish uchun saqlaymiz.
    """
    class Meta(UserSerializer.Meta):
        # Profil tahrirlashda ruhsat beriladigan fieldlar
        fields = [
            'id', 'email', 'phone', 'full_name', 'birth_date',
            'region', 'district', 'address', 'avatar', 'bio',
            'telegram_username', 'role', 'parent_phone', 'parent_name'
        ]
        read_only_fields = ['id', 'role']  # Rolni tahrirlashga ruxsat yo'q


class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = StudentProfile
        fields = '__all__'


class TeacherProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = TeacherProfile
        fields = '__all__'


# --- II. Autentifikatsiya (Ro'yxatdan o'tish) Serializerlar ---

class RegisterSerializer(serializers.ModelSerializer):
    """ Talabalar uchun Ro'yxatdan o'tish (Telefon asosida) """
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = [
            'phone', 'full_name', 'father_name', 'birth_date',
            'region', 'district', 'address', 'parent_phone', 'parent_name',
            'password', 'password2', 'role'
        ]
        read_only_fields = ['role']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": _("Parollar mos emas")})
        return attrs

    def validate_phone(self, value):
        if not value.startswith('+998'):
            raise serializers.ValidationError(_("Telefon +998 bilan boshlanishi kerak"))
        if len(value) != 13:
            raise serializers.ValidationError(_("Telefon 13 ta belgidan iborat bo'lishi kerak"))
        if User.objects.filter(phone=value).exists():
            raise serializers.ValidationError(_("Bu telefon raqami allaqachon ro'yxatdan o'tgan."))
        return value

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')

        user = User.objects.create(role='student', **validated_data)
        user.set_password(password)
        user.username = user.phone
        user.save()

        # Student profile yaratish
        StudentProfile.objects.create(user=user)

        return user


# --- III. Admin tomonidan Yaratish Serializeri ---

class AdminCreateStudentSerializer(serializers.ModelSerializer):
    """ Admin tomonidan Talaba yaratish """
    password = serializers.CharField(write_only=True, required=False)
    auto_password = serializers.BooleanField(write_only=True, default=True)

    class Meta:
        model = User
        fields = [
            'phone', 'full_name', 'father_name', 'birth_date',
            'region', 'district', 'address', 'parent_phone', 'parent_name',
            'password', 'auto_password', 'telegram_username'
        ]

    def validate(self, attrs):
        if 'phone' in attrs and User.objects.filter(phone=attrs['phone']).exists():
            raise serializers.ValidationError({"phone": _("Bu telefon raqami allaqachon ro'yxatdan o'tgan.")})
        return attrs

    def create(self, validated_data):
        auto_password = validated_data.pop('auto_password', True)
        password = validated_data.pop('password', None)

        if auto_password or not password:
            if 'phone' not in validated_data or not validated_data['phone']:
                raise serializers.ValidationError({"phone": _("Telefon raqami bo'lmasa avtomatik parol yaratib bo'lmaydi.")})

            password = validated_data['phone'][-4:]

        user = User.objects.create(
            role='student',
            username=validated_data['phone'],
            **validated_data
        )
        user.set_password(password)
        user.save()

        StudentProfile.objects.create(user=user)

        return user


# --- IV. Kirish (Login) Serializerlar ---

class StudentLoginSerializer(serializers.Serializer):
    """ Talabalar uchun kirish (Telefon va Parol) """
    phone = serializers.CharField(max_length=13, required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, data):
        phone = data.get('phone')
        password = data.get('password')

        if phone and password:
            user = authenticate(username=phone, password=password)

            if not user:
                raise serializers.ValidationError(_("Telefon raqami yoki parol noto'g'ri."))

            if user.role != 'student':
                raise serializers.ValidationError(_("Bu kirish faqat Talabalar uchun."))

            if not user.is_active:
                raise serializers.ValidationError(_("Foydalanuvchi hisobi faol emas."))

            data['user'] = user
            return data
        raise serializers.ValidationError(_("Telefon raqami va parol majburiy."))


# TeacherLoginSerializer ni quyidagicha almashtiring:

class TeacherLoginSerializer(serializers.Serializer):
    """ O'qituvchilar uchun kirish (Username/Email va Parol) """
    username = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, data):
        import logging
        logger = logging.getLogger(__name__)
        
        username = data.get('username')
        password = data.get('password')
        user = None

        if username and password:
            logger.info(f"🔐 Login attempt for: {username}")
            
            # 1. Avval user mavjudligini tekshirish
            try:
                user = User.objects.get(username=username)
                logger.info(f"✅ User topildi: {user.username} (role: {user.role})")
            except User.DoesNotExist:
                # Email orqali tekshirish
                if '@' in username:
                    try:
                        user = User.objects.get(email=username)
                        logger.info(f"✅ User email orqali topildi: {user.username}")
                    except User.DoesNotExist:
                        logger.error(f"❌ User topilmadi: {username}")
                        raise serializers.ValidationError(_("Username/Email yoki parol noto'g'ri."))
                else:
                    logger.error(f"❌ User topilmadi: {username}")
                    raise serializers.ValidationError(_("Username/Email yoki parol noto'g'ri."))
            
            # 2. Parol tekshirish
            if not user.check_password(password):
                logger.error(f"❌ Noto'g'ri parol: {username}")
                raise serializers.ValidationError(_("Username/Email yoki parol noto'g'ri."))
            
            logger.info(f"✅ Parol to'g'ri: {username}")
            
            # 3. Rolni tekshirish
            if user.role not in ['teacher', 'admin']:
                logger.error(f"❌ Noto'g'ri rol: {user.role}")
                raise serializers.ValidationError(_("Bu kirish faqat O'qituvchilar va Adminlar uchun."))
            
            # 4. Faollikni tekshirish
            if not user.is_active:
                logger.error(f"❌ User faol emas: {username}")
                raise serializers.ValidationError(_("Foydalanuvchi hisobi faol emas."))
            
            logger.info(f"✅ Login muvaffaqiyatli: {username}")
            data['user'] = user
            return data
            
        raise serializers.ValidationError(_("Username/Email va parol majburiy."))


class LoginResponseUserSerializer(serializers.ModelSerializer):
    """ Login javobida qaytariladigan user ma'lumotlari uchun serializer """
    class Meta:
        model = User
        fields = [
            'id', 'username', 'full_name', 'email', 'phone', 'role',
            'avatar', 'bio', 'points', 'is_verified', 'created_at'
        ]
        read_only_fields = ['id', 'points', 'created_at']


class UserDetailSerializer(serializers.ModelSerializer):
    """ To'liq user profili (admin va o'z profili uchun) """
    class Meta:
        model = User
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'points', 'is_verified']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
        }

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)
        return super().update(instance, validated_data)


class FullStudentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = StudentProfile
        fields = '__all__'

    def create(self, validated_data):
        user_id = validated_data.pop('user_id', None)
        if user_id:
            validated_data['user_id'] = user_id
        return super().create(validated_data)


class FullTeacherProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = TeacherProfile
        fields = '__all__'

    def create(self, validated_data):
        user_id = validated_data.pop('user_id', None)
        if user_id:
            validated_data['user_id'] = user_id
        return super().create(validated_data)


class UserRegisterSerializer(serializers.ModelSerializer):
    """ Yangi foydalanuvchi ro'yxatdan o'tkazish (student uchun) """
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'phone', 'full_name', 'password', 'password2']
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Parollar mos kelmaydi")
        if data.get('phone') and User.objects.filter(phone=data['phone']).exists():
            raise serializers.ValidationError("Bu telefon raqami allaqachon ro'yxatdan o'tgan")
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            username=validated_data['username'],
            phone=validated_data.get('phone'),
            full_name=validated_data.get('full_name'),
            password=validated_data['password'],
            role='student'
        )
        return user
    
class AdminUserCreateSerializer(serializers.ModelSerializer):
    """Admin tomonidan istalgan rol bilan user yaratish"""
    password = serializers.CharField(write_only=True, required=False)
    password2 = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            'username', 'phone', 'email', 'full_name', 'role',
            'father_name', 'birth_date', 'region', 'district', 'address',
            'parent_name', 'parent_phone', 'group_name', 'class_room',
            'telegram_username', 'is_active', 'points', 'badges',
            'password', 'password2'
        ]

    def validate(self, attrs):
        password = attrs.get('password')
        password2 = attrs.get('password2')

        if password or password2:
            if password != password2:
                raise serializers.ValidationError("Parollar mos emas")
        
        phone = attrs.get('phone')
        if phone and User.objects.filter(phone=phone).exists():
            raise serializers.ValidationError("Bu telefon raqami allaqachon ishlatilgan")

        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        validated_data.pop('password2', None)

        user = User(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_password('default123')  # vaqtinchalik parol
        user.username = validated_data.get('phone', validated_data.get('username', f"user_{user.id}"))
        user.save()

        # Profil yaratish
        if user.role == 'student':
            StudentProfile.objects.get_or_create(user=user)
        elif user.role == 'teacher':
            TeacherProfile.objects.get_or_create(user=user)

        return user


class AdminUserUpdateSerializer(serializers.ModelSerializer):
    """Admin tomonidan user tahrirlash (rol, points, badges)"""
    class Meta:
        model = User
        fields = '__all__'
        read_only_fields = ['username', 'created_at']

    def update(self, instance, validated_data):
        badges = validated_data.get('badges', instance.badges)
        points = validated_data.get('points', instance.points)

        instance = super().update(instance, validated_data)
        instance.badges = badges
        instance.points = points
        instance.save()
        return instance    
    
# apps/users/serializers.py (oxiriga qo'shing)

class AdminUserCreateSerializer(serializers.ModelSerializer):
    """Admin tomonidan user yaratish"""
    password = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = User
        fields = ['username', 'phone', 'email', 'full_name', 'role', 'password']
    
    def create(self, validated_data):
        password = validated_data.pop('password', 'default123')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        
        # Profile yaratish
        if user.role == 'student':
            StudentProfile.objects.get_or_create(user=user)
        elif user.role == 'teacher':
            TeacherProfile.objects.get_or_create(user=user)
        
        return user


class AdminUserUpdateSerializer(serializers.ModelSerializer):
    """Admin tomonidan user tahrirlash"""
    class Meta:
        model = User
        fields = '__all__'
        read_only_fields = ['username', 'created_at']  

      
          