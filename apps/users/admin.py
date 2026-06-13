# apps/users/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django import forms
from .models import User
from django.utils.translation import gettext_lazy as _ # Agar models.py dan foydalansangiz kerak

# --- 1. Yangi foydalanuvchi yaratish formasi (Admin orqali qo'shish uchun) ---
class UserCreationForm(forms.ModelForm):
    """Admin paneli orqali yangi foydalanuvchi yaratish uchun forma."""
    password = forms.CharField(label='Parol', widget=forms.PasswordInput)
    password2 = forms.CharField(label='Parolni tasdiqlash', widget=forms.PasswordInput)

    class Meta:
        model = User
        # username, full_name, email, phone va role asosiy maydonlar sifatida
        fields = ('username', 'full_name', 'email', 'phone', 'role') 

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get("password")
        password2 = cleaned_data.get("password2")
        
        # Parol mosligini tekshirish
        if password and password != password2:
            self.add_error('password2', "Parollar mos kelmaydi.")
        
        # Rolga qarab majburiylikni tekshirish
        role = cleaned_data.get("role")
        phone = cleaned_data.get("phone")
        
        # Talaba bo'lsa, telefon raqami majburiy (chunki ular telefon orqali kiradi)
        if role == 'student' and not phone:
            self.add_error('phone', "Talaba rolida telefon raqami kiritish majburiy.")
            
        return cleaned_data

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password"])
        # Superuser holatida is_staff/is_superuser ni to'g'ri o'rnatish
        if user.role == 'admin':
            user.is_staff = True
            user.is_superuser = True
        elif user.role == 'teacher':
            user.is_staff = True # O'qituvchilar panelga kirishi uchun
        
        if commit:
            user.save()
        return user

# --- 2. Mavjud foydalanuvchini tahrirlash formasi ---
class UserChangeForm(forms.ModelForm):
    """Admin panelida mavjud foydalanuvchini tahrirlash uchun forma."""
    class Meta:
        model = User
        fields = '__all__'


# --- 3. Asosiy Admin klassi (Tuzatilgan) ---
@admin.register(User)
class CustomUserAdmin(BaseUserAdmin):
    form = UserChangeForm
    add_form = UserCreationForm

    # 🚨 XATONI TUZATISH: Tahrirlash mumkin bo'lmagan maydonlarni qo'shish
    readonly_fields = ('created_at', 'updated_at', 'last_login', 'date_joined') 

    # Yangi foydalanuvchi yaratish sahifasida ko'rinadigan maydonlar
    add_fieldsets = (
        (None, {'fields': ('username', 'full_name', 'email', 'phone', 'role', 'password', 'password2')}),
        ('Status', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
    )

    # Ro'yxat sahifasida ko'rinadigan maydonlar
    list_display = ('username', 'full_name', 'email', 'phone', 'role', 'is_active', 'is_staff')
    list_filter = ('role', 'is_active', 'is_staff')
    
    # Tahrirlash sahifasida ko'rinadigan maydonlar
    fieldsets = (
        ('Asosiy Ma\'lumotlar', {'fields': ('username', 'full_name', 'email', 'phone', 'avatar')}),
        ('Qo\'shimcha Ma\'lumotlar', {'fields': ('father_name', 'birth_date', 'region', 'district', 'address', 'bio', 'telegram_username', 'telegram_id', 'group_name', 'class_room')}),
        ('Ota-Ona Ma\'lumotlari', {'fields': ('parent_name', 'parent_phone')}),
        ('Rollar va Statuslar', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'is_verified')}),
        ('Ruxsatlar', {'fields': ('user_permissions', 'groups')}),
        ('Loyihaviy Ma\'lumotlar', {'fields': ('points', 'badges')}),
        # Tahrirlanmaydigan maydonlar bu yerda ko'rsatiladi, ular yuqorida readonly_fields ga qo'shilgan
        ('Muhim Sanalar', {'fields': ('last_login', 'date_joined', 'created_at', 'updated_at')}), 
        ('Parolni o\'zgartirish', {'fields': ('password',)}), # Password tahrirlash uchun BaseUserAdmin dan qolgan
    )
    
    search_fields = ('username', 'full_name', 'email', 'phone')
    ordering = ('role', 'full_name')

    # BaseUserAdmin dan inherit qilganimiz uchun password maydonini tahrirlash uchun
    # uni fieldsets ichiga qo'shish kerak. (Yuqorida qo'shildi)

UserAdmin = CustomUserAdmin