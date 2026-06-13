# apps/courses/models.py — 100% TOʻLIQ VA ISHLAYDIGAN FINAL VERSIYA

from django.db import models
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.users.models import User  # User modelini toʻgʻri import qildik
from django.conf import settings


class Category(models.Model):
    name = models.CharField(max_length=100, verbose_name=_("Kategoriya nomi"))
    slug = models.SlugField(max_length=120, unique=True, blank=True, verbose_name=_("Slug"))
    description = models.TextField(blank=True, verbose_name=_("Tavsif"))
    image = models.ImageField(upload_to='categories/', blank=True, null=True, verbose_name=_("Rasm"))
    icon = models.CharField(max_length=50, blank=True, verbose_name=_("Ikon"))
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subcategories', verbose_name=_("Ota kategoriya"))
    order = models.IntegerField(default=0, verbose_name=_("Tartib raqami"))
    is_active = models.BooleanField(default=True, verbose_name=_("Faol"))

    class Meta:
        verbose_name = _("Kategoriya")
        verbose_name_plural = _("Kategoriyalar")
        ordering = ['order', 'name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Category.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)


class Module(models.Model):
    course = models.ForeignKey('Course', on_delete=models.CASCADE, related_name='modules', verbose_name=_("Kurs"))
    title = models.CharField(max_length=200, verbose_name=_("Modul nomi"))
    description = models.TextField(blank=True, verbose_name=_("Tavsif"))
    order = models.IntegerField(default=0, verbose_name=_("Tartib raqami"))

    class Meta:
        ordering = ['order']
        verbose_name = _("Modul")
        verbose_name_plural = _("Modullar")

    def __str__(self):
        return f"{self.course.title} — {self.title}"


class Course(models.Model):
    LEVEL_CHOICES = [
        ('beginner', 'Boshlang\'ich'),
        ('intermediate', 'O\'rta'),
        ('advanced', 'Yuqori'),
    ]

    STATUS_CHOICES = [
        ('draft', 'Qoralama'),
        ('published', 'Nashr qilingan'),
        ('archived', 'Arxivlangan'),
    ]

    title = models.CharField(max_length=200, verbose_name=_("Kurs nomi"))
    slug = models.SlugField(max_length=255, unique=True, blank=True, verbose_name=_("URL slug"))
    description = models.TextField(blank=True, verbose_name=_("To'liq tavsif"))
    short_description = models.CharField(max_length=300, verbose_name=_("Qisqa tavsif"))
    thumbnail = models.ImageField(upload_to='courses/thumbnails/', blank=True, null=True, verbose_name=_("Kurs rasmi"))
    video_preview = models.URLField(blank=True, null=True, verbose_name=_("Preview video"))

    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='courses',
        verbose_name=_("Kategoriya")
    )
    teacher = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='teaching_courses',
        limit_choices_to={'role__in': ['teacher', 'admin']},
        verbose_name=_("O'qituvchi")
    )

    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='beginner', verbose_name=_("Daraja"))
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', verbose_name=_("Status"))

    price = models.DecimalField(max_digits=10, decimal_places=0, verbose_name=_("Narx (so'm)"))
    discount_price = models.DecimalField(max_digits=10, decimal_places=0, null=True, blank=True, verbose_name=_("Chegirma narxi"))

    duration_weeks = models.PositiveIntegerField(default=1, verbose_name=_("Davomiyligi (hafta)"))
    total_lectures = models.PositiveIntegerField(default=0, verbose_name=_("Darslar soni"))
    total_duration_minutes = models.PositiveIntegerField(default=0, verbose_name=_("Umumiy davomiylik (daqiqa)"))

    requirements = models.TextField(blank=True, verbose_name=_("Talablar"))
    what_you_learn = models.JSONField(default=list, blank=True, verbose_name=_("Nima o'rganasiz"))
    tags = models.JSONField(default=list, blank=True, verbose_name=_("Teglar"))

    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0, verbose_name=_("Reyting"))
    total_reviews = models.PositiveIntegerField(default=0, verbose_name=_("Sharhlar soni"))
    total_students = models.PositiveIntegerField(default=0, verbose_name=_("Talabalar soni"))

    is_featured = models.BooleanField(default=False, verbose_name=_("Tavsiya etilgan"))
    is_bestseller = models.BooleanField(default=False, verbose_name=_("Bestseller"))

    language = models.CharField(max_length=50, default='uz', verbose_name=_("Til"))
    certificate_available = models.BooleanField(default=True, verbose_name=_("Sertifikat beriladi"))

    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Yaratilgan vaqt"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Yangilangan vaqt"))
    published_at = models.DateTimeField(null=True, blank=True, verbose_name=_("Nashr qilingan vaqt"))

    class Meta:
        verbose_name = _("Kurs")
        verbose_name_plural = _("Kurslar")
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['category', 'status']),
            models.Index(fields=['teacher']),
        ]

    def __str__(self):
        return self.title

    @property
    def category_name(self):
        return self.category.name if self.category else "Kategoriyasiz"

    # Avtomatik slug yaratish
    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Course.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)


class Lesson(models.Model):
    LESSON_TYPE_CHOICES = [
        ('video', 'Video'),
        ('article', 'Maqola'),
        ('quiz', 'Test'),
        ('assignment', 'Vazifa'),
    ]

    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='lessons', verbose_name=_("Modul"))
    title = models.CharField(max_length=200, verbose_name=_("Dars nomi"))
    lesson_type = models.CharField(max_length=20, choices=LESSON_TYPE_CHOICES, default='video', verbose_name=_("Dars turi"))
    order = models.IntegerField(default=0, verbose_name=_("Tartib raqami"))

    video_url = models.URLField(blank=True, null=True, verbose_name=_("Video URL"))
    video_duration = models.PositiveIntegerField(default=0, help_text=_("Soniyalarda"), verbose_name=_("Video davomiyligi"))
    content = models.TextField(blank=True, verbose_name=_("Matnli kontent"))
    file = models.FileField(upload_to='lessons/files/', null=True, blank=True, verbose_name=_("Fayl"))

    is_preview = models.BooleanField(default=False, verbose_name=_("Preview dars"))
    is_mandatory = models.BooleanField(default=True, verbose_name=_("Majburiy"))

    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Yaratilgan vaqt"))

    class Meta:
        ordering = ['order']
        verbose_name = _("Dars")
        verbose_name_plural = _("Darslar")

    def __str__(self):
        return f"{self.module.title} — {self.title}"


class Quiz(models.Model):
    lesson = models.OneToOneField(Lesson, on_delete=models.CASCADE, related_name='quiz', verbose_name=_("Dars"))
    title = models.CharField(max_length=200, verbose_name=_("Test nomi"))
    description = models.TextField(blank=True, verbose_name=_("Tavsif"))
    passing_score = models.IntegerField(default=70, verbose_name=_("O'tish balli"))
    time_limit_minutes = models.IntegerField(default=30, verbose_name=_("Vaqt chegarasi (daqiqa)"))
    attempts_allowed = models.IntegerField(default=3, verbose_name=_("Urinishlar soni"))

    def __str__(self):
        return self.title


class Question(models.Model):
    QUESTION_TYPE_CHOICES = [
        ('single', 'Bir javobli'),
        ('multiple', 'Ko\'p javobli'),
        ('text', 'Matnli javob'),
    ]

    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions', verbose_name=_("Test"))
    question_text = models.TextField(verbose_name=_("Savol matni"))
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPE_CHOICES, default='single', verbose_name=_("Savol turi"))
    points = models.IntegerField(default=1, verbose_name=_("Ball"))
    order = models.IntegerField(default=0, verbose_name=_("Tartib"))
    explanation = models.TextField(blank=True, verbose_name=_("Tushuntirish"))

    class Meta:
        ordering = ['order']
        verbose_name = _("Savol")
        verbose_name_plural = _("Savollar")

    def __str__(self):
        return self.question_text[:50]


class Answer(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers', verbose_name=_("Savol"))
    answer_text = models.CharField(max_length=500, verbose_name=_("Javob matni"))
    is_correct = models.BooleanField(default=False, verbose_name=_("To'g'ri javob"))
    order = models.IntegerField(default=0, verbose_name=_("Tartib"))

    class Meta:
        ordering = ['order']
        verbose_name = _("Javob")
        verbose_name_plural = _("Javoblar")

    def __str__(self):
        return self.answer_text


class StudentProgress(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='progress', verbose_name=_("Talaba"))
    course = models.ForeignKey(Course, on_delete=models.CASCADE, verbose_name=_("Kurs"))
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, verbose_name=_("Dars"))

    is_completed = models.BooleanField(default=False, verbose_name=_("Tugallangan"))
    time_spent_seconds = models.IntegerField(default=0, verbose_name=_("Sarflangan vaqt (soniya)"))
    last_position_seconds = models.IntegerField(default=0, verbose_name=_("Oxirgi pozitsiya"))

    started_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Boshlangan vaqt"))
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name=_("Tugallangan vaqt"))

    class Meta:
        unique_together = ['student', 'lesson']
        verbose_name = _("Talaba jarayoni")
        verbose_name_plural = _("Talabalar jarayoni")

    def __str__(self):
        return f"{self.student} — {self.lesson}"


class QuizAttempt(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_attempts', verbose_name=_("Talaba"))
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, verbose_name=_("Test"))
    score = models.DecimalField(max_digits=5, decimal_places=2, verbose_name=_("Ball"))
    total_questions = models.IntegerField(verbose_name=_("Umumiy savollar"))
    correct_answers = models.IntegerField(verbose_name=_("To'g'ri javoblar"))
    time_taken_seconds = models.IntegerField(verbose_name=_("Sarflangan vaqt"))
    answers = models.JSONField(default=dict, verbose_name=_("Javoblar"))
    is_passed = models.BooleanField(default=False, verbose_name=_("O'tdi"))

    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-started_at']
        verbose_name = _("Test urinishi")
        verbose_name_plural = _("Test urinishi")

    def __str__(self):
        return f"{self.student} — {self.quiz} — {self.score}%"


class Review(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='reviews', verbose_name=_("Kurs"))
    student = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name=_("Talaba"))
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)], verbose_name=_("Baholash"))
    title = models.CharField(max_length=200, verbose_name=_("Sarlavha"))
    content = models.TextField(verbose_name=_("Fikr"))
    is_verified_purchase = models.BooleanField(default=False, verbose_name=_("Tasdiqlangan sotib olish"))

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['course', 'student']
        ordering = ['-created_at']
        verbose_name = _("Fikr")
        verbose_name_plural = _("Fikrlar")

    def __str__(self):
        return f"{self.student} — {self.course} — {self.rating}⭐"


class Group(models.Model):
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='groups',
        verbose_name=_("Kurs")
    )
    name = models.CharField(max_length=200, verbose_name=_("Guruh nomi"))
    start_date = models.DateField(null=True, blank=True, verbose_name=_("Boshlanish sanasi"))
    end_date = models.DateField(null=True, blank=True, verbose_name=_("Tugash sanasi"))
    max_students = models.PositiveIntegerField(default=30, verbose_name=_("Maksimal talabalar"))
    is_active = models.BooleanField(default=True, verbose_name=_("Faol"))

    class Meta:
        verbose_name = _("Guruh")
        verbose_name_plural = _("Guruhlar")
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.course.title} — {self.name}"

class Enrollment(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='enrollments'
    )
    course = models.ForeignKey(
        'Course', 
        on_delete=models.CASCADE, 
        related_name='enrollments'
    )
    
    # ← BU YERNI O‘ZGARTIRAMIZ
    group = models.ForeignKey(
        'Group', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='enrollments'
    )

    full_name = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    age = models.PositiveIntegerField(null=True, blank=True)
    knowledge_level = models.CharField(max_length=50, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    
    enrolled_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20, 
        choices=[('active', 'Active'), ('completed', 'Completed'), ('dropped', 'Dropped')],
        default='active'
    )

    class Meta:
        unique_together = ('user', 'course')
        ordering = ['-enrolled_at']

    def __str__(self):
        return f"{self.user} - {self.course}"