# apps/chat/views.py
from rest_framework import generics, permissions, status, serializers
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.contrib.auth import get_user_model
from .models import Message, Conversation
from .serializers import MessageSerializer

User = get_user_model()

class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        other_user_id = self.request.query_params.get('receiver')  # ← Frontend 'receiver' yuboradi

        if other_user_id:
            try:
                other_user = User.objects.get(id=other_user_id)
            except User.DoesNotExist:
                return Message.objects.none()

            # Suhbatni topish: ikkala user ishtirok etgan conversation
            conversation = Conversation.objects.filter(
                participants=user
            ).filter(
                participants=other_user
            ).first()

            if conversation:
                return Message.objects.filter(conversation=conversation).select_related('sender')
        
        return Message.objects.none()

    def perform_create(self, serializer):
        receiver_id = self.request.data.get('receiver')
        
        if not receiver_id:
            raise serializers.ValidationError({"receiver": "Qabul qiluvchi ID talab qilinadi"})

        try:
            receiver = User.objects.get(id=receiver_id)
        except User.DoesNotExist:
            raise serializers.ValidationError({"receiver": "Bunday foydalanuvchi topilmadi"})

        # Suhbat topish yoki yaratish
        conversation = Conversation.objects.filter(
            participants=self.request.user
        ).filter(
            participants=receiver
        ).first()

        if not conversation:
            conversation = Conversation.objects.create()
            conversation.participants.add(self.request.user, receiver)

        serializer.save(
            sender=self.request.user,
            conversation=conversation
        )