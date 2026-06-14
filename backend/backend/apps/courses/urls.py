from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    CategoryViewSet, CourseViewSet, LessonViewSet, QuizViewSet,
    ReviewViewSet, StudentProgressViewSet, EnrollmentViewSet,
    TeacherCourseViewSet, TeacherEnrollmentListView, TeacherStatsView,
    AdminCategoryViewSet, AdminCourseViewSet, AdminModuleViewSet,
    AdminLessonViewSet, AdminQuizViewSet, AdminQuestionViewSet,
    AdminAnswerViewSet, AdminStudentProgressViewSet,
    AdminQuizAttemptViewSet, AdminEnrollmentViewSet,
    AdminReviewViewSet,
    LessonCompleteView,
)

app_name = 'courses'

router = DefaultRouter()

router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'lessons', LessonViewSet, basename='lesson')
router.register(r'quizzes', QuizViewSet, basename='quiz')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'progress', StudentProgressViewSet, basename='progress')
router.register(r'enrollments', EnrollmentViewSet, basename='enrollment')
router.register(r'teacher/courses', TeacherCourseViewSet, basename='teacher-course')
router.register(r'admin/categories', AdminCategoryViewSet, basename='admin-category')
router.register(r'admin/courses', AdminCourseViewSet, basename='admin-course')
router.register(r'admin/modules', AdminModuleViewSet, basename='admin-module')
router.register(r'admin/lessons', AdminLessonViewSet, basename='admin-lesson')
router.register(r'admin/quizzes', AdminQuizViewSet, basename='admin-quiz')
router.register(r'admin/questions', AdminQuestionViewSet, basename='admin-question')
router.register(r'admin/answers', AdminAnswerViewSet, basename='admin-answer')
router.register(r'admin/progress', AdminStudentProgressViewSet, basename='admin-progress')
router.register(r'admin/attempts', AdminQuizAttemptViewSet, basename='admin-attempt')
router.register(r'admin/enrollments', AdminEnrollmentViewSet, basename='admin-enrollment')
router.register(r'admin/reviews', AdminReviewViewSet, basename='admin-review')

urlpatterns = [
    # ← MUHIM: custom URL routerdan OLDIN!
    path('lessons/<int:lesson_id>/complete/',
         LessonCompleteView.as_view(),
         name='lesson-complete'),

    path('teacher/enrollments/', TeacherEnrollmentListView.as_view(), name='teacher-enrollments'),
    path('teacher/stats/', TeacherStatsView.as_view(), name='teacher-stats'),

    path('', include(router.urls)),
]