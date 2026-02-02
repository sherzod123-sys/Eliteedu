import hashlib
import hmac
import requests
from django.conf import settings
from decimal import Decimal

class PaymeProvider:
    def __init__(self):
        self.merchant_id = settings.PAYME_MERCHANT_ID
        self.secret_key = settings.PAYME_SECRET_KEY
        self.url = 'https://checkout.paycom.uz/api'
    
    def generate_link(self, order_id, amount):
        # amount in tiyin (1 so'm = 100 tiyin)
        amount_tiyin = int(amount * 100)
        
        params = {
            'm': self.merchant_id,
            'ac.order_id': order_id,
            'a': amount_tiyin,
            'c': f'https://eduplatform.uz/payment/callback/'
        }
        
        link = f"https://checkout.paycom.uz/{';'.join([f'{k}={v}' for k, v in params.items()])}"
        return link
    
    def verify_payment(self, transaction_id):
        # Payme webhook dan kelgan to'lovni tekshirish
        pass

class ClickProvider:
    def __init__(self):
        self.merchant_id = settings.CLICK_MERCHANT_ID
        self.service_id = settings.CLICK_SERVICE_ID
        self.secret_key = settings.CLICK_SECRET_KEY
    
    def generate_link(self, order_id, amount):
        params = {
            'merchant_id': self.merchant_id,
            'service_id': self.service_id,
            'amount': amount,
            'transaction_param': order_id,
            'return_url': 'https://eduplatform.uz/payment/success/',
        }
        
        link = f"https://my.click.uz/services/pay?{self._build_query(params)}"
        return link
    
    def _build_query(self, params):
        return '&'.join([f'{k}={v}' for k, v in params.items()])
    
    def verify_payment(self, click_trans_id, merchant_trans_id, sign_string):
        # Click webhook dan kelgan to'lovni tekshirish
        sign_check = hashlib.md5(
            f"{click_trans_id}{self.service_id}{self.secret_key}{merchant_trans_id}0".encode()
        ).hexdigest()
        
        return sign_check == sign_string

class PaymentService:
    @staticmethod
    def create_payment_link(order, provider='payme'):
        if provider == 'payme':
            service = PaymeProvider()
            return service.generate_link(order.order_id, order.final_amount)
        elif provider == 'click':
            service = ClickProvider()
            return service.generate_link(order.order_id, order.final_amount)
        else:
            raise ValueError("Invalid payment provider")
    
    @staticmethod
    def process_payment(order, transaction_id, provider='payme'):
        from .models import Order
        
        order.status = 'completed'
        order.transaction_id = transaction_id
        order.save()
        
        # Kursga yozish
        order.course.enrolled_students.add(order.student)
        order.course.total_students += 1
        order.course.save()
        
        # Notification yuborish
        from apps.notifications.tasks import send_course_enrollment_notification
        send_course_enrollment_notification.delay(order.student.id, order.course.id)
        
        return True