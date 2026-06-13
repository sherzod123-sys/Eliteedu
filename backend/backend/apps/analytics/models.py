from django.db import models

class AnalyticsEvent(models.Model):
    event_name = models.CharField(max_length=255)
    user_id = models.IntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(blank=True, null=True)

    def __str__(self):
        return f"{self.event_name} - {self.user_id} at {self.timestamp}"