from django.contrib import admin
from django.http import HttpResponse
from django.utils.translation import gettext_lazy as _
import csv

from .models import (
    Category, Course, Module, Lesson, Enrollment, Review, 
    Quiz, Question, Answer, StudentProgress, QuizAttempt
)

# ============================================================
# 1. INLINE MODELLAR
# ============================================================

class AnswerInline(admin.TabularInline):
    model = Answer
    extra = 1
    fields = ('answer_text', 'is_correct', 'order')

class QuestionInline(admin.StackedInline):
    model = Question
    extra = 1
    show_change_link = True

class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 1
    fields = ('title', 'lesson_type', 'order', 'is_preview')
    ordering = ('order',)

class ModuleInline(admin.StackedInline):
    model = Module
    extra = 1
    show_change_link = True
    ordering = ('order',)

# ============================================================
# 2. ADMIN KLASSLARI
# ============================================================

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'teacher', 'category', 'price', 'status', 'total_students')
    list_filter = ('status', 'category', 'level', 'is_featured')
    search_fields = ('title', 'teacher__username')
    prepopulated_fields = {'slug': ('title',)}
    inlines = [ModuleInline]
    actions = ['make_published', 'export_as_csv']

    @admin.action(description="Tanlangan kurslarni nashr etish")
    def make_published(self, request, queryset):
        queryset.update(status='published')

    @admin.action(description="CSV eksport")
    def export_as_csv(self, request, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="courses.csv"'
        writer = csv.writer(response)
        writer.writerow(['ID', 'Title', 'Status'])
        for obj in queryset:
            writer.writerow([obj.id, obj.title, obj.status])
        return response

@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order')
    list_filter = ('course',)
    inlines = [LessonInline]

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'module', 'lesson_type', 'order', 'is_preview')
    list_filter = ('module__course', 'lesson_type')
    ordering = ('module', 'order')

@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ('title', 'lesson')
    inlines = [QuestionInline]

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('question_text', 'quiz', 'question_type')
    inlines = [AnswerInline]

@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ('answer_text', 'question', 'is_correct', 'order')

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'progress', 'enrolled_at')
    list_filter = ('course', 'enrolled_at')
    search_fields = ('user__username', 'course__title')

@admin.register(StudentProgress)
class StudentProgressAdmin(admin.ModelAdmin):
    list_display = ('student', 'lesson', 'is_completed', 'completed_at')
    list_filter = ('is_completed', 'lesson__module__course')

@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ('student', 'quiz', 'score', 'is_passed', 'started_at')
    list_filter = ('is_passed', 'quiz__lesson__module__course')
    readonly_fields = ('started_at', 'submitted_at')

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent', 'is_active', 'order')
    list_editable = ('is_active', 'order')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'rating', 'created_at')
    list_filter = ('rating', 'course')