from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from decimal import Decimal

from apps.orders.models import Order, PromoCode

from apps.courses.models import Course, Category
from apps.users.models import User


class OrderTests(APITestCase):
    """
    Order app uchun to‘liq API testlari:
    - Order yaratish
    - Promo code bilan order yaratish
    - Promo code tekshirish
    """

    def setUp(self):
        # -------------------------
        # Student user yaratish
        # -------------------------
        self.user = User.objects.create_user(
            phone='+998905555555',
            full_name='Test Student',
            password='test123',
            role='student'
        )

        # -------------------------
        # Token bilan login
        # -------------------------
        login_url = reverse('auth-login')
        response = self.client.post(login_url, {
            'phone': '+998905555555',
            'password': 'test123'
        })

        # Login muvaffaqiyatini tekshirish
        self.assertEqual(response.status_code, status.HTTP_200_OK, msg="Login failed")

        self.token = response.data['tokens']['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

        # -------------------------
        # Teacher user yaratish
        # -------------------------
        self.teacher = User.objects.create_user(
            phone='+998906666666',
            full_name='Teacher',
            password='teacher123',
            role='teacher'
        )

        # -------------------------
        # Category yaratish
        # -------------------------
        self.category = Category.objects.create(name='Test', slug='test')

        # -------------------------
        # Course yaratish
        # -------------------------
        self.course = Course.objects.create(
            title='Test Course',
            slug='test-course',
            description='Test course desc',
            short_description='Short desc',
            teacher=self.teacher,
            category=self.category,
            price=Decimal('500000.00'),
            status='published'
        )

        # -------------------------
        # Promo Code yaratish
        # -------------------------
        self.promo = PromoCode.objects.create(
            code='DISCOUNT20',
            discount_type='percentage',
            discount_value=Decimal('20.00'),
            max_uses=100,
            valid_from=timezone.now() - timezone.timedelta(days=1),
            valid_until=timezone.now() + timezone.timedelta(days=365),
            is_active=True
        )

    # ----------------------------------------------------
    # 1. Order yaratish testi
    # ----------------------------------------------------
    def test_create_order(self):
        url = reverse('order-list')
        data = {
            'course_id': self.course.id,
            'payment_method': 'payme'
        }

        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        order = Order.objects.get(id=response.data['order']['id'])
        self.assertEqual(order.student, self.user)
        self.assertEqual(order.course, self.course)
        self.assertEqual(order.status, 'pending')

    # ----------------------------------------------------
    # 2. Promo code bilan order yaratish testi
    # ----------------------------------------------------
    def test_create_order_with_promo(self):
        url = reverse('order-list')
        data = {
            'course_id': self.course.id,
            'promo_code': 'DISCOUNT20',
            'payment_method': 'payme'
        }

        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        order = Order.objects.get(id=response.data['order']['id'])
        expected_discount = self.course.price * Decimal('0.20')
        self.assertEqual(order.discount_amount, expected_discount)
        self.assertEqual(order.final_amount, self.course.price - expected_discount)

    # ----------------------------------------------------
    # 3. Promo code tekshirish testi
    # ----------------------------------------------------
    def test_validate_promo_code(self):
        url = reverse('promocode-validate')
        data = {
            'code': 'DISCOUNT20',
            'course_id': self.course.id
        }

        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['valid'])
        self.assertEqual(response.data['discount_type'], 'percentage')
