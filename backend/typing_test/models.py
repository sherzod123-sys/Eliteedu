from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone

LANGUAGE_CHOICES = [
    ('uz', "O'zbek"),
    ('en', 'English'),
    ('ru', 'Русский'),
]

DIFFICULTY_CHOICES = [
    ('easy', 'Easy'),
    ('medium', 'Medium'),
    ('hard', 'Hard'),
]


class TypingTest(models.Model):
    title = models.CharField(max_length=255, blank=True)
    text = models.TextField()
    language = models.CharField(max_length=10, choices=LANGUAGE_CHOICES, default='uz')
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium')
    is_active = models.BooleanField(default=True)
    word_count = models.PositiveIntegerField(editable=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Typing Test"
        verbose_name_plural = "Typing Tests"
        ordering = ['-created_at']

    def __str__(self):
        return self.title or f"Typing Test #{self.pk}"

    def save(self, *args, **kwargs):
        self.word_count = len(self.text.split())
        super().save(*args, **kwargs)


# =========================
# Typing natijalari
# =========================

class TypingResult(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='typing_results'
    )
    test = models.ForeignKey(
        TypingTest,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='results'
    )

    wpm = models.FloatField(
        validators=[MinValueValidator(0)],
        verbose_name="WPM"
    )
    accuracy = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Aniqlik (%)"
    )
    time_taken = models.FloatField(
        validators=[MinValueValidator(0)],
        verbose_name="Vaqt (soniya)"
    )
    errors = models.PositiveIntegerField(default=0)
    is_arena = models.BooleanField(default=False)

    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        verbose_name = "Typing Result"
        verbose_name_plural = "Typing Results"
        ordering = ['-wpm', '-accuracy']
        indexes = [
            models.Index(fields=['-wpm']),
            models.Index(fields=['user', '-created_at']),
        ]

    def __str__(self):
        return f"{self.user} | {self.wpm:.1f} WPM | {self.accuracy:.1f}%"


# =========================
# Arena Leaderboard
# =========================

class ArenaLeaderboard(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='arena_leaderboard'
    )
    best_wpm = models.FloatField(default=0)
    best_accuracy = models.FloatField(default=0)
    total_arena_tests = models.PositiveIntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Arena Leaderboard"
        verbose_name_plural = "Arena Leaderboard"
        ordering = ['-best_wpm', '-best_accuracy']

    def __str__(self):
        return f"{self.user} | {self.best_wpm:.1f} WPM"
