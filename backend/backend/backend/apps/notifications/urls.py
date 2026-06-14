# apps/notifications/urls.py
from django.urls import path
from django.http import HttpResponse

# Hozircha test uchun oddiy view
def test_notification(request):
    return HttpResponse("Notifications app ishlayapti!")

urlpatterns = [
    path("", test_notification, name="test"),
]