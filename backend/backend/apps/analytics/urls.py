from django.urls import path
from . import views

app_name = 'analytics'

urlpatterns = [
    # Example URL patterns
    path('dashboard/', views.dashboard, name='dashboard'),
    path('report/<int:report_id>/', views.report_detail, name='report_detail'),
]