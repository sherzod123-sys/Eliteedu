from django.db import models
from django_tenants.models import TenantMixin, DomainMixin


class Client(TenantMixin):
    name = models.CharField(max_length=100)
    created_on = models.DateField(auto_now_add=True)
    logo = models.ImageField(upload_to='logos/', null=True, blank=True)
    primary_color = models.CharField(max_length=7, default='#3B82F6')
    secondary_color = models.CharField(max_length=7, default='#8B5CF6')
    is_active = models.BooleanField(default=True)
    subscription_plan = models.CharField(max_length=50, default='starter')
    max_students = models.IntegerField(default=100)
    max_courses = models.IntegerField(default=10)
    
    auto_create_schema = True
    
    class Meta:
        db_table = 'tenants_client'

class Domain(DomainMixin):
    pass