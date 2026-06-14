<<<<<<< HEAD
# apps/courses/urls.py — To‘g‘ri versiya

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet  # va agar boshqa viewsetlar bo‘lsa, ularni ham import qiling
from .views import CategoryViewSet

# Router yaratamiz
router = DefaultRouter()
router.register(r'', CourseViewSet, basename='course')  # Muhim: bo‘sh prefix ('')
router.register(r'categories', CategoryViewSet, basename='category')
# Agar kategoriyalar bo‘lsa, quyidagini ochib qo‘ying:
from .views import CategoryViewSet
router.register(r'categories', CategoryViewSet, basename='category')

urlpatterns = [
    path('', include(router.urls)),  # /api/courses/ → kurslar ro‘yxati
]
=======
# apps/courses/urls.py — TO'G'RILANGAN VERSIYA

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet,
    CourseViewSet,
    LessonViewSet,
    QuizViewSet,
    ReviewViewSet,
    StudentProgressViewSet,
    EnrollmentViewSet,
    TeacherCourseViewSet,
    TeacherEnrollmentListView,
    TeacherStatsView,
    AdminCategoryViewSet,
    AdminCourseViewSet,
    AdminModuleViewSet,
    AdminLessonViewSet,
    AdminQuizViewSet,
    AdminQuestionViewSet,
    AdminAnswerViewSet,
    AdminStudentProgressViewSet,
    AdminQuizAttemptViewSet,
    AdminEnrollmentViewSet,
    AdminReviewViewSet,
)

app_name = 'courses'

# Router yaratamiz
router = DefaultRouter()

# UMUMIY ENDPOINTLAR (Talabalar uchun)
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'lessons', LessonViewSet, basename='lesson')
router.register(r'quizzes', QuizViewSet, basename='quiz')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'progress', StudentProgressViewSet, basename='progress')
router.register(r'enrollments', EnrollmentViewSet, basename='enrollment')

# O'QITUVCHI ENDPOINTLAR
router.register(r'teacher/courses', TeacherCourseViewSet, basename='teacher-course')

# ADMIN ENDPOINTLAR
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
    # Router endpoint'lari
    path('', include(router.urls)),
    
    # O'qituvchi qo'shimcha endpoint'lari
    path('teacher/enrollments/', TeacherEnrollmentListView.as_view(), name='teacher-enrollments'),
    path('teacher/stats/', TeacherStatsView.as_view(), name='teacher-stats'),
]

# NATIJADA QUYIDAGI ENDPOINT'LAR MAVJUD BO'LADI:
#
# ===== STUDENT ENDPOINTLAR =====
# GET  /api/courses/categories/                   - Kategoriyalar ro'yxati
# GET  /api/courses/courses/                      - Barcha kurslar
# GET  /api/courses/courses/{id}/                 - Kurs detali
# GET  /api/courses/courses/my-courses/           - Mening kurslarim (AUTH)
# GET  /api/courses/courses/dashboard/            - Dashboard (AUTH)
# GET  /api/courses/courses/featured/             - Featured kurslar
# GET  /api/courses/courses/bestsellers/          - Bestseller kurslar
# GET  /api/courses/courses/search/?q=python      - Qidiruv
# GET  /api/courses/courses/by_category/?category=python - Kategoriya bo'yicha
# GET  /api/courses/courses/{id}/curriculum/      - Kurs curriculum
# POST /api/courses/courses/{id}/enroll/          - Kursga yozilish (AUTH)
#
# GET  /api/courses/lessons/                      - Darslar
# POST /api/courses/lessons/{id}/complete/        - Darsni tugatish (AUTH)
#
# GET  /api/courses/quizzes/                      - Testlar
# POST /api/courses/quizzes/{id}/submit/          - Test topshirish (AUTH)
#
# GET  /api/courses/progress/                     - Mening progressim (AUTH)
# GET  /api/courses/enrollments/                  - Mening yozilishlarim (AUTH)
# GET  /api/courses/reviews/                      - Sharhlar
#
# ===== TEACHER ENDPOINTLAR =====
# GET  /api/courses/teacher/courses/              - O'qituvchining kurslari
# POST /api/courses/teacher/courses/              - Yangi kurs yaratish
# PUT  /api/courses/teacher/courses/{id}/         - Kursni tahrirlash
# POST /api/courses/teacher/courses/{id}/publish/ - Kursni nashr qilish
# POST /api/courses/teacher/courses/{id}/unpublish/ - Draft holatga qaytarish
# GET  /api/courses/teacher/enrollments/          - Talabalar ro'yxati
# GET  /api/courses/teacher/stats/                - Statistika
#
# ===== ADMIN ENDPOINTLAR =====
# GET  /api/courses/admin/courses/                - Barcha kurslar
# POST /api/courses/admin/courses/make_published/ - Kurslarni nashr qilish
# POST /api/courses/admin/courses/make_draft/     - Kurslarni draft qilish
# GET  /api/courses/admin/courses/export_csv/     - CSV export
# ... va boshqa admin CRUD operatsiyalar
>>>>>>> ad8d8b2732545b73f5a0ee23a9db7d28fd05bf61
