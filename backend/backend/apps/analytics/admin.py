from django.contrib import admin
from .models import AnalyticsEvent


@admin.register(AnalyticsEvent)
class AnalyticsEventAdmin(admin.ModelAdmin):
    list_display = ('id', 'event_name', 'user_id', 'timestamp')
    search_fields = ('event_name', 'user_id')
    list_filter = ('event_name', 'timestamp')
    ordering = ('-timestamp',)
