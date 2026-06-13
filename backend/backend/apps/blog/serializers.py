# apps/blog/serializers.py — FINAL VERSIYA

from rest_framework import serializers
from .models import BlogPost, Comment
from django.contrib.auth import get_user_model

User = get_user_model()

class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)
    author_full_name = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'content', 'author_name', 'author_full_name', 'created_at']
        read_only_fields = ['author_name', 'author_full_name', 'created_at']

    def get_author_full_name(self, obj):
        return f"{obj.author.first_name} {obj.author.last_name}".strip() or obj.author.username


class BlogPostAuthorSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'full_name', 'role']

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username


class BlogPostSerializer(serializers.ModelSerializer):
    author = BlogPostAuthorSerializer(read_only=True)
    author_full_name = serializers.SerializerMethodField(read_only=True)
    featured_image = serializers.ImageField(required=False, allow_null=True)
    comments = CommentSerializer(many=True, read_only=True)
    comments_count = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'content', 'excerpt', 'featured_image',
            'author', 'author_full_name', 'status', 'tags',
            'views_count', 'likes_count', 'dislikes_count',
            'seo_title', 'seo_description', 'created_at', 'updated_at', 'published_at',
            'comments', 'comments_count'
        ]
        read_only_fields = [
            'id', 'slug', 'author', 'views_count', 'likes_count', 'dislikes_count',
            'created_at', 'updated_at', 'published_at'
        ]

    def get_author_full_name(self, obj):
        if obj.author:
            return f"{obj.author.first_name} {obj.author.last_name}".strip() or obj.author.username
        return "Noma'lum"

    def get_comments_count(self, obj):
        return obj.comments.count()