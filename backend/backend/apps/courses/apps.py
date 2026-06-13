# apps/courses/apps.py — TO'G'IRLANGAN VERSIYA

from django.apps import AppConfig


class CoursesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.courses'
    verbose_name = 'Kurslar'

    def ready(self):
        # Signallarni import qilish
        import apps.courses.signals  # <--- BU QATOR MUHIM!