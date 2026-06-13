from django.db import models
from apps.users.models import User

class Notification(models.Model):
    NOTIFICATION_TYPE_CHOICES = [
        ('course_enrolled', 'Kursga yozilindi'),
        ('lesson_completed', 'Dars tugallandi'),
        ('certificate_issued', 'Sertifikat berildi'),
        ('payment_successful', 'To\'lov muvaffaqiyatli'),
        ('new_message', 'Yangi xabar'),
        ('course_updated', 'Kurs yangilandi'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPE_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    link = models.URLField(blank=True)
    
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.title}"