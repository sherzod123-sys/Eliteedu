from django import forms
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

User = get_user_model()

class PhoneOrEmailAuthenticationForm(AuthenticationForm):
    username = forms.CharField(label='Telefon raqam yoki Email')
    
    def clean_username(self):
        username = self.cleaned_data.get('username')
        
        # Telefon formatida bo'lsa
        if username.startswith('+') or username.isdigit():
            # Telefon formatini to'g'irlash
            if username.isdigit():
                if len(username) == 9:  # 901234567
                    username = '+998' + username
                elif len(username) == 12:  # 998901234567
                    username = '+' + username
            
            # Telefon orqali user qidirish
            try:
                user = User.objects.get(phone=username)
                return user.username if user.username else username
            except User.DoesNotExist:
                raise ValidationError('Bu telefon raqam bilan foydalanuvchi topilmadi')
        
        # Email formatida bo'lsa
        elif '@' in username:
            try:
                user = User.objects.get(email=username)
                return user.username if user.username else user.phone
            except User.DoesNotExist:
                raise ValidationError('Bu email bilan foydalanuvchi topilmadi')
        
        # Username bo'lsa
        else:
            try:
                user = User.objects.get(username=username)
                return username
            except User.DoesNotExist:
                raise ValidationError('Bu username bilan foydalanuvchi topilmadi')