# backend/project/admin.py — BARCHA MODELLAR CHIQADI + STATISTIKA

from django.contrib import admin
from django.template.response import TemplateResponse
from django.urls import path

# Users
from apps.users.admin import UserAdmin
from apps.users.models import User

# Courses — BARCHA ADMIN KLASSLAR
from apps.courses.admin import (
    CategoryAdmin, CourseAdmin, ModuleAdmin, LessonAdmin,
    QuizAdmin, QuestionAdmin, AnswerAdmin,
    StudentProgressAdmin, QuizAttemptAdmin, ReviewAdmin, EnrollmentAdmin
)
from apps.courses.models import (
    Category, Course, Module, Lesson, Quiz, Question, Answer,
    StudentProgress, QuizAttempt, Review, Enrollment
)

class MyAdminSite(admin.AdminSite):
    site_header = "EduPlatform Admin Paneli"
    site_title = "EduPlatform"
    index_title = "Boshqaruv markazi"

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('stats/', self.admin_view(self.stats_view), name='stats'),
        ]
        return custom_urls + urls

    def stats_view(self, request):
        context = dict(
            self.each_context(request),
            total_users=User.objects.count(),
            total_teachers=User.objects.filter(role='teacher').count(),
            total_students=User.objects.filter(role='student').count(),
            total_courses=Course.objects.count(),
            published_courses=Course.objects.filter(status='published').count(),
            total_enrollments=Enrollment.objects.count(),
        )
        return TemplateResponse(request, "admin/stats.html", context)

# Custom admin site
admin_site = MyAdminSite(name='myadmin')

# BARCHA MODELLAR RO‘YXATDAN O‘TKAZILDI
admin_site.register(User, UserAdmin)

admin_site.register(Category, CategoryAdmin)
admin_site.register(Course, CourseAdmin)
admin_site.register(Module, ModuleAdmin)
admin_site.register(Lesson, LessonAdmin)
admin_site.register(Quiz, QuizAdmin)
admin_site.register(Question, QuestionAdmin)
admin_site.register(Answer, AnswerAdmin)
admin_site.register(StudentProgress, StudentProgressAdmin)
admin_site.register(QuizAttempt, QuizAttemptAdmin)
admin_site.register(Review, ReviewAdmin)
admin_site.register(Enrollment, EnrollmentAdmin)