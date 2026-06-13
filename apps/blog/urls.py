# apps/blog/urls.py

from django.urls import path
from .views import (
    BlogPostListView,
    BlogPostDetailView,
    BlogPostReactionView,
    BlogPostCommentsView,
    TeacherBlogListView,
    TeacherBlogCRUDView,
)

app_name = 'blog'

urlpatterns = [
    # 1. AVVAL MAXSUS (TEACHER) YO'LLARNI QO'YAMIZ
    path('teacher/', TeacherBlogListView.as_view(), name='teacher-blog-list'),
    path('teacher/<int:pk>/', TeacherBlogCRUDView.as_view(), name='teacher-blog-detail'),

    # 2. KEYIN UMUMIY YO'LLAR
    path('', BlogPostListView.as_view(), name='blog-list'),
    path('<slug:slug>/', BlogPostDetailView.as_view(), name='blog-detail'),
    path('<slug:slug>/reaction/', BlogPostReactionView.as_view(), name='blog-reaction'),
    path('<slug:slug>/comments/', BlogPostCommentsView.as_view(), name='blog-comments'),
]