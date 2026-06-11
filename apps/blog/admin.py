# apps/blog/admin.py — TO‘G‘RI VA ISHLAYDIGAN VERSIYA

from django.contrib import admin
from .models import BlogPost

@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'status', 'created_at', 'published_at']
    list_filter = ['status', 'created_at', 'author']
    search_fields = ['title', 'content', 'author__full_name', 'author__username']
    readonly_fields = ['created_at', 'updated_at', 'published_at', 'views_count', 'likes_count']
    prepopulated_fields = {"slug": ("title",)}  # title o'zgarganda slug avto to'ldiriladi

    fieldsets = (
        ("Asosiy ma'lumotlar", {
            'fields': ('title', 'slug', 'author', 'status', 'content', 'excerpt', 'featured_image')
        }),
        ("Qo‘shimcha", {
            'fields': ('tags', 'seo_title', 'seo_description'),
            'classes': ('collapse',)
        }),
        ("Statistika", {
            'fields': ('views_count', 'likes_count', 'created_at', 'updated_at', 'published_at'),
            'classes': ('collapse',)
        }),
    )