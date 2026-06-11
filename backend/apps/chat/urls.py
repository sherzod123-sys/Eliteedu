# apps/chat/urls.py
from django.urls import path
from .views import MessageListCreateView

app_name = 'chat'

urlpatterns = [
    path('messages/', MessageListCreateView.as_view(), name='messages'),
]