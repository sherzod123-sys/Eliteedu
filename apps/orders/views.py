# apps/orders/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Order, PromoCode
from .payment import PaymentService
from .serializers import OrderSerializer, PromoCodeSerializer
from apps.courses.models import Course


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Faqat hozirgi foydalanuvchining buyurtmalari
        return Order.objects.filter(student=self.request.user)

    def create(self, request):
        course_id = request.data.get('course_id')
        promo_code = request.data.get('promo_code')
        payment_method = request.data.get('payment_method', 'payme')

        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({'error': 'Kurs topilmadi'}, status=status.HTTP_404_NOT_FOUND)

        # Allaqachon yozilganmi
        if course.enrolled_students.filter(id=request.user.id).exists():
            return Response({'error': 'Siz allaqachon bu kursga yozilgansiz'}, 
                            status=status.HTTP_400_BAD_REQUEST)

        # Narxni hisoblash
        amount = course.discount_price or course.price
        discount_amount = 0

        # Promo kodni qo‘llash
        if promo_code:
            try:
                promo = PromoCode.objects.get(
                    code=promo_code,
                    is_active=True,
                    valid_from__lte=timezone.now(),
                    valid_until__gte=timezone.now()
                )

                if promo.used_count >= promo.max_uses:
                    return Response({'error': 'Promo kod limiti tugagan'}, 
                                    status=status.HTTP_400_BAD_REQUEST)

                if promo.discount_type == 'percentage':
                    discount_amount = amount * (promo.discount_value / 100)
                else:
                    discount_amount = promo.discount_value

                promo.used_count += 1
                promo.save()

            except PromoCode.DoesNotExist:
                return Response({'error': 'Promo kod topilmadi'}, 
                                status=status.HTTP_400_BAD_REQUEST)

        final_amount = amount - discount_amount

        # Buyurtma yaratish
        order = Order.objects.create(
            student=request.user,
            course=course,
            amount=amount,
            discount_amount=discount_amount,
            final_amount=final_amount,
            promo_code=promo_code,
            payment_method=payment_method
        )

        # To‘lov linkini yaratish
        payment_link = PaymentService.create_payment_link(order, payment_method)

        return Response({
            'order': OrderSerializer(order).data,
            'payment_link': payment_link
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def verify_payment(self, request, pk=None):
        order = self.get_object()
        transaction_id = request.data.get('transaction_id')

        if PaymentService.process_payment(order, transaction_id):
            order.status = 'completed'
            order.paid_at = timezone.now()
            order.transaction_id = transaction_id
            order.save()
            return Response({'message': 'To\'lov muvaffaqiyatli'})

        return Response({'error': 'To\'lov xatosi'}, status=status.HTTP_400_BAD_REQUEST)


class PromoCodeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PromoCode.objects.filter(is_active=True)
    serializer_class = PromoCodeSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'])
    def validate(self, request):
        code = request.data.get('code')
        course_id = request.data.get('course_id')

        try:
            promo = PromoCode.objects.get(
                code=code,
                is_active=True,
                valid_from__lte=timezone.now(),
                valid_until__gte=timezone.now()
            )

            if promo.used_count >= promo.max_uses:
                return Response({'valid': False, 'message': 'Promo kod limiti tugagan'},
                                status=status.HTTP_400_BAD_REQUEST)

            # Kurs uchun mosligini tekshirish
            if promo.courses.exists() and not promo.courses.filter(id=course_id).exists():
                return Response({'valid': False, 'message': 'Bu promo kod ushbu kurs uchun yaroqsiz'},
                                status=status.HTTP_400_BAD_REQUEST)

            return Response({
                'valid': True,
                'discount_type': promo.discount_type,
                'discount_value': promo.discount_value,
                'message': f'Promo kod qo\'llanildi: {promo.discount_value}{ "%" if promo.discount_type=="percentage" else ""} chegirma'
            })

        except PromoCode.DoesNotExist:
            return Response({'valid': False, 'message': 'Promo kod topilmadi'}, status=status.HTTP_404_NOT_FOUND)
