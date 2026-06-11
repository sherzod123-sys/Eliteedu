from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.validators import RegexValidator
from django.utils.translation import gettext_lazy as _
import random

# --- Rol tanlovlari ---
ROLE_CHOICES = [
    ('student', 'O\'quvchi'),
    ('teacher', 'O\'qituvchi'),
    ('admin', 'Administrator'),
]


# --- 1. Custom User Manager ---
class UserManager(BaseUserManager):
    """Custom user model manager"""
    
    def _create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError('Username kiriting!')
        
        email = extra_fields.get('email')
        if email:
            email = self.normalize_email(email)
            extra_fields['email'] = email
        
        user = self.model(username=username, **extra_fields)
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        extra_fields.setdefault('role', 'student')
        return self._create_user(username, password, **extra_fields)

    def create_superuser(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser is_staff=True bo\'lishi kerak')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser is_superuser=True bo\'lishi kerak')

        return self._create_user(username, password, **extra_fields)


# --- 2. Custom User Modeli ---
class User(AbstractUser):
    """Custom User model - matches existing database schema"""
    
    # Telefon raqam validatori
    phone_regex = RegexValidator(
        regex=r'^\+?998?\d{9}$',
        message="Telefon raqami +998XXXXXXXXX formatida bo'lishi kerak"
    )
    
    # Asosiy maydonlar (database'dagi mavjud ustunlarga mos)
    full_name = models.CharField(
        _('To\'liq ism'),
        max_length=200,
        blank=True,
        default=''
    )
    
    phone = models.CharField(
        _('Telefon raqam'),
        validators=[phone_regex],
        max_length=13,
        unique=True,
        null=True,
        blank=True
    )
    
    role = models.CharField(
        _('Rol'),
        max_length=20,
        choices=ROLE_CHOICES,
        default='student'
    )
    
    # 4 xonali foydalanuvchi kodi
    user_code = models.CharField(
        max_length=4,
        unique=True,
        blank=True,
        null=True,
        help_text="Dashboard uchun 4 xonali foydalanuvchi kodi"
    )
    
    # Shaxsiy ma'lumotlar
    father_name = models.CharField(
        _('Otasining ismi'),
        max_length=100,
        blank=True,
        default=''
    )
    
    birth_date = models.DateField(
        _('Tug\'ilgan sana'),
        null=True,
        blank=True
    )
    
    # Manzil ma'lumotlari
    region = models.CharField(
        _('Viloyat'),
        max_length=100,
        blank=True,
        default=''
    )
    
    district = models.CharField(
        _('Tuman'),
        max_length=100,
        blank=True,
        default=''
    )
    
    address = models.TextField(
        _('Manzil'),
        blank=True,
        default=''
    )
    
    # Ota-ona ma'lumotlari
    parent_name = models.CharField(
        _('Ota-ona ismi'),
        max_length=200,
        blank=True,
        default=''
    )
    
    parent_phone = models.CharField(
        _('Ota-ona telefoni'),
        max_length=13,
        blank=True,
        default=''
    )
    
    # Qo'shimcha maydonlar
    avatar = models.ImageField(
        _('Avatar'),
        upload_to='avatars/',
        null=True,
        blank=True
    )
    
    bio = models.TextField(
        _('Biografiya'),
        blank=True,
        default=''
    )
    
    # Telegram ma'lumotlari
    telegram_username = models.CharField(
        _('Telegram username'),
        max_length=100,
        blank=True,
        default=''
    )
    
    telegram_id = models.CharField(
        _('Telegram ID'),
        max_length=100,
        blank=True,
        default=''
    )
    
    # O'quv ma'lumotlari
    class_room = models.CharField(
        _('Sinf'),
        max_length=50,
        blank=True,
        null=True
    )
    
    group_name = models.CharField(
        _('Guruh'),
        max_length=100,
        blank=True,
        null=True
    )
    
    # Gamifikatsiya
    points = models.IntegerField(
        _('Ballar'),
        default=0
    )
    
    badges = models.JSONField(
        _('Nishonlar'),
        default=list,
        blank=True
    )
    
    # Status maydonlari
    is_verified = models.BooleanField(
        _('Tasdiqlangan'),
        default=False
    )
    
    is_active = models.BooleanField(
        _('Faol'),
        default=True
    )
    
    # Vaqt maydonlari
    created_at = models.DateTimeField(
        _('Yaratilgan vaqt'),
        auto_now_add=True
    )
    
    updated_at = models.DateTimeField(
        _('Yangilangan vaqt'),
        auto_now=True
    )

    # Manager va boshqa sozlamalar
    objects = UserManager()
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    class Meta:
        verbose_name = _('Foydalanuvchi')
        verbose_name_plural = _('Foydalanuvchilar')
        ordering = ['-created_at']
        db_table = 'users_user'

    def __str__(self):
        return self.full_name or self.username

    def save(self, *args, **kwargs):
        # Agar user_code bo'sh bo'lsa, random 4 xonali raqam yaratamiz
        if not self.user_code:
            self.user_code = self.generate_unique_code()
        super().save(*args, **kwargs)

    def generate_unique_code(self):
        """Unikal 4 xonali raqam yaratish"""
        while True:
            code = f"{random.randint(0, 9999):04d}"  # 0000 dan 9999 gacha
            if not User.objects.filter(user_code=code).exists():
                return code
    
    def get_full_name(self):
        """To'liq ismni qaytarish"""
        return self.full_name or f"{self.first_name} {self.last_name}".strip() or self.username
    
    def get_short_name(self):
        """Qisqa ismni qaytarish"""
        return self.first_name or self.username
    
    @property
    def age(self):
        """Yoshni hisoblash"""
        if self.birth_date:
            from datetime import date
            today = date.today()
            return today.year - self.birth_date.year - (
                (today.month, today.day) < (self.birth_date.month, self.birth_date.day)
            )
        return None


# --- 3. Student Profile ---
class StudentProfile(models.Model):
    """
    DIQQAT: enrolled_courses va completed_courses maydonlari
    courses app'da Enrollment model orqali boshqariladi.
    Bu yerda faqat asosiy statistika saqlanadi.
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='student_profile'
    )
    education_level = models.CharField(
        _('Ta\'lim darajasi'),
        max_length=100,
        blank=True
    )
    school_name = models.CharField(
        _('Maktab nomi'),
        max_length=200,
        blank=True
    )
    grade = models.IntegerField(
        _('Sinf'),
        null=True,
        blank=True
    )
    
    # Statistika (courses app'dan olinadi)
    total_points = models.IntegerField(
        _('Jami ballar'),
        default=0
    )
    level = models.IntegerField(
        _('Daraja'),
        default=1
    )
    total_watch_time = models.IntegerField(
        _('Jami tomosha vaqti (daqiqa)'),
        default=0
    )
    
    # Shaxsiy ma'lumotlar
    learning_goals = models.TextField(
        _('O\'rganish maqsadlari'),
        blank=True
    )
    interests = models.JSONField(
        _('Qiziqishlar'),
        default=list,
        blank=True
    )

    class Meta:
        verbose_name = _('Student Profil')
        verbose_name_plural = _('Student Profillari')

    def __str__(self):
        return f"Student: {self.user.get_full_name()}"
    
    def get_enrolled_courses(self):
        """Ro'yxatdan o'tgan kurslarni olish"""
        from apps.courses.models import Enrollment
        return Enrollment.objects.filter(
            student=self.user,
            is_active=True
        ).select_related('course')
    
    def get_completed_courses(self):
        """Tugatilgan kurslarni olish"""
        from apps.courses.models import Enrollment
        return Enrollment.objects.filter(
            student=self.user,
            is_completed=True
        ).select_related('course')


# --- 4. Teacher Profile ---
class TeacherProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='teacher_profile'
    )
    specialization = models.CharField(
        _('Mutaxassislik'),
        max_length=200
    )
    experience_years = models.IntegerField(
        _('Ish tajribasi (yil)'),
        default=0
    )
    rating = models.DecimalField(
        _('Reyting'),
        max_digits=3,
        decimal_places=2,
        default=0.0
    )
    total_students = models.IntegerField(
        _('Jami talabalar'),
        default=0
    )
    total_courses = models.IntegerField(
        _('Jami kurslar'),
        default=0
    )
    hourly_rate = models.DecimalField(
        _('Soatlik tarif'),
        max_digits=10,
        decimal_places=2,
        default=0
    )
    is_verified = models.BooleanField(
        _('Tasdiqlangan'),
        default=False
    )
    social_links = models.JSONField(
        _('Ijtimoiy tarmoqlar'),
        default=dict,
        blank=True,
        help_text="Ijtimoiy tarmoq havolalari"
    )

    class Meta:
        verbose_name = _('O\'qituvchi Profil')
        verbose_name_plural = _('O\'qituvchi Profillari')

    def __str__(self):
        return f"Teacher: {self.user.get_full_name()}"


# Jazzmin uchun moslik
CustomUser = User