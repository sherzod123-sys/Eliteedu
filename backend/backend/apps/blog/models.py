# apps/blog/models.py — TO‘LIQ TO‘G‘RILANGAN VA FINAL VERSIYA (2025)

from django.db import models
from django.utils.text import slugify
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class BlogPost(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Qoralama'),
        ('published', 'Nashr qilingan'),
    ]

    title = models.CharField(max_length=200, verbose_name="Sarlavha")
    slug = models.SlugField(max_length=220, unique=True, blank=True, verbose_name="Slug")
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='blog_posts',
        verbose_name="Muallif"
    )

    content = models.TextField(verbose_name="Matn")
    excerpt = models.CharField(max_length=300, blank=True, verbose_name="Qisqa tavsif")
    featured_image = models.ImageField(
        upload_to='blog/images/',
        blank=True,
        null=True,
        verbose_name="Asosiy rasm"
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
        verbose_name="Holati"
    )
    tags = models.JSONField(default=list, blank=True, verbose_name="Teglar")

    views_count = models.PositiveIntegerField(default=0, verbose_name="Ko‘rishlar soni")
    likes_count = models.PositiveIntegerField(default=0, verbose_name="Yoqtirishlar soni")
    dislikes_count = models.PositiveIntegerField(default=0, verbose_name="Yoqtirmasliklar soni")

    seo_title = models.CharField(max_length=200, blank=True, verbose_name="SEO sarlavha")
    seo_description = models.CharField(max_length=300, blank=True, verbose_name="SEO tavsif")

    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Yaratilgan vaqt")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Yangilangan vaqt")
    published_at = models.DateTimeField(null=True, blank=True, verbose_name="Nashr qilingan vaqt")

    class Meta:
        ordering = ['-published_at', '-created_at']
        verbose_name = 'Blog maqola'
        verbose_name_plural = 'Blog maqolalar'
        indexes = [
            models.Index(fields=['status', '-published_at']),
            models.Index(fields=['slug']),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        # Slug avtomatik to‘ldirish
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while BlogPost.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug

        # Birinchi marta published bo‘lganda published_at ni to‘ldirish
        if self.status == 'published' and not self.published_at:
            self.published_at = timezone.now()

        super().save(*args, **kwargs)


# Izohlar modeli
class Comment(models.Model):
    post = models.ForeignKey(
        BlogPost,
        on_delete=models.CASCADE,
        related_name='comments',
        verbose_name="Maqola"
    )
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='blog_comments',
        verbose_name="Muallif"
    )
    content = models.TextField(verbose_name="Izoh matni")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Yaratilgan vaqt")

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Izoh'
        verbose_name_plural = 'Izohlar'

    def __str__(self):
        return f"{self.author.get_full_name() or self.author.username} — {self.post.title[:30]}"


# Like/Dislike reaktsiyalari modeli
class BlogPostReaction(models.Model):
    REACTION_CHOICES = [
        ('like', 'Like'),
        ('dislike', 'Dislike'),
    ]

    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='reactions')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    reaction = models.CharField(max_length=10, choices=REACTION_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['post', 'user']  # Bir user bir marta reaction qo‘yadi
        verbose_name = 'Reaktsiya'
        verbose_name_plural = 'Reaktsiyalar'

    def __str__(self):
        return f"{self.user} — {self.reaction} — {self.post.title[:30]}"