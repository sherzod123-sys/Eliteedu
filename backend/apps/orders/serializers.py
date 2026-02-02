# apps/orders/serializers.py
from rest_framework import serializers
from .models import Order, PromoCode
from apps.courses.models import Course
from apps.users.models import User

class OrderSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.title', read_only=True)
    student_name = serializers.CharField(source='student.username', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'order_id',
            'student',
            'student_name',
            'course',
            'course_name',
            'amount',
            'discount_amount',
            'final_amount',
            'promo_code',
            'status',
            'payment_method',
            'transaction_id',
            'created_at',
            'paid_at',
        ]
        read_only_fields = ['order_id', 'status', 'transaction_id', 'created_at', 'paid_at']

class PromoCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PromoCode
        fields = [
            'id',
            'code',
            'discount_type',
            'discount_value',
            'max_uses',
            'used_count',
            'valid_from',
            'valid_until',
            'is_active',
            'courses',
        ]
        read_only_fields = ['used_count']
