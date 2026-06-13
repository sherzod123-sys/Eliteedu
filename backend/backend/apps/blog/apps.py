# apps/blog/apps.py

from django.apps import AppConfig

class BlogConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.blog'  # To'liq yo'l — MUHIM!
    verbose_name = 'Blog'  # Admin panelda shu nom chiqadi