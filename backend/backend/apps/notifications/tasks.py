from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from .models import Notification
from apps.users.models import User
import requests

@shared_task
def send_email_notification(user_id, subject, message):
    try:
        user = User.objects.get(id=user_id)
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[user.email] if user.email else [],
            fail_silently=False,
        )
        
        return f"Email sent to {user.email}"
    except Exception as e:
        return f"Error: {str(e)}"

@shared_task
def send_sms_notification(phone, message):
    # Eskiz.uz, Playmobile.uz yoki boshqa SMS provider
    try:
        # SMS API integration
        api_url = "https://notify.eskiz.uz/api/message/sms/send"
        token = settings.SMS_API_TOKEN
        
        response = requests.post(
            api_url,
            data={
                'mobile_phone': phone,
                'message': message,
                'from': '4546',
            },
            headers={'Authorization': f'Bearer {token}'}
        )
        
        return f"SMS sent to {phone}"
    except Exception as e:
        return f"Error: {str(e)}"

@shared_task
def send_telegram_notification(telegram_id, message):
    try:
        bot_token = settings.TELEGRAM_BOT_TOKEN
        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        
        response = requests.post(url, json={
            'chat_id': telegram_id,
            'text': message,
            'parse_mode': 'HTML'
        })
        
        return f"Telegram sent to {telegram_id}"
    except Exception as e:
        return f"Error: {str(e)}"

@shared_task
def create_notification(user_id, notification_type, title, message, link=''):
    try:
        user = User.objects.get(id=user_id)
        
        notification = Notification.objects.create(
            user=user,
            notification_type=notification_type,
            title=title,
            message=message,
            link=link
        )
        
        # Telegram orqali yuborish (agar telegram_id mavjud bo'lsa)
        if user.telegram_id:
            send_telegram_notification.delay(user.telegram_id, f"{title}\n\n{message}")
        
        return f"Notification created for {user.full_name}"
    except Exception as e:
        return f"Error: {str(e)}"

@shared_task
def send_course_enrollment_notification(user_id, course_id):
    from apps.courses.models import Course
    
    try:
        user = User.objects.get(id=user_id)
        course = Course.objects.get(id=course_id)
        
        message = f"Assalomu alaykum {user.full_name}!\n\nSiz '{course.title}' kursiga muvaffaqiyatli yozildingiz. O'qishni boshlashingiz mumkin!"
        
        # Notification yaratish
        create_notification.delay(
            user_id,
            'course_enrolled',
            'Kursga yozildingiz!',
            message,
            f'/learn/{course.id}'
        )
        
        # SMS yuborish
        if user.phone:
            send_sms_notification.delay(user.phone, message)
        
        return "Enrollment notification sent"
    except Exception as e:
        return f"Error: {str(e)}"

@shared_task
def send_certificate_notification(user_id, certificate_id):
    from apps.orders.models import Certificate
    
    try:
        user = User.objects.get(id=user_id)
        certificate = Certificate.objects.get(id=certificate_id)
        
        message = f"Tabriklaymiz {user.full_name}!\n\nSiz '{certificate.course.title}' kursini muvaffaqiyatli yakunladingiz. Sertifikatingizni yuklab olishingiz mumkin."
        
        create_notification.delay(
            user_id,
            'certificate_issued',
            'Sertifikat olindi!',
            message,
            f'/certificates/{certificate.certificate_id}'
        )
        
        return "Certificate notification sent"
    except Exception as e:
        return f"Error: {str(e)}"

@shared_task
def send_payment_reminder(user_id, order_id):
    from apps.orders.models import Order
    
    try:
        user = User.objects.get(id=user_id)
        order = Order.objects.get(id=order_id)
        
        if order.status == 'pending':
            message = f"{user.full_name}, '{order.course.title}' kursi uchun to'lovni yakunlamadingiz. To'lovni amalga oshiring!"
            
            send_telegram_notification.delay(user.telegram_id, message)
        
        return "Payment reminder sent"
    except Exception as e:
        return f"Error: {str(e)}"

@shared_task
def generate_daily_report():
    from django.utils import timezone
    from datetime import timedelta
    
    today = timezone.now().date()
    yesterday = today - timedelta(days=1)
    
    # Statistika
    from apps.orders.models import Order
    from apps.courses.models import Course
    
    new_enrollments = Order.objects.filter(
        created_at__date=yesterday,
        status='completed'
    ).count()
    
    revenue = Order.objects.filter(
        created_at__date=yesterday,
        status='completed'
    ).aggregate(total=models.Sum('final_amount'))['total'] or 0
    
    # Admin'larga yuborish
    admins = User.objects.filter(role='admin', is_active=True)
    
    for admin in admins:
        message = f"""
📊 Kunlik hisobot ({yesterday})

✅ Yangi yozilganlar: {new_enrollments}
💰 Daromad: {revenue:,.0f} so'm

EduPlatform Admin Panel
        """
        
        if admin.telegram_id:
            send_telegram_notification.delay(admin.telegram_id, message)
    
    return "Daily report generated"

@shared_task
def cleanup_old_notifications():
    from django.utils import timezone
    from datetime import timedelta
    
    # 30 kundan eski notificationlarni o'chirish
    old_date = timezone.now() - timedelta(days=30)
    deleted = Notification.objects.filter(
        created_at__lt=old_date,
        is_read=True
    ).delete()
    
    return f"Deleted {deleted[0]} old notifications"