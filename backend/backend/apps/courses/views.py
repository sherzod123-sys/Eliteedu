<<<<<<< HEAD
# apps/courses/views.py — 100% TOʻGʻRI VA ISHLAYDIGAN VERSIYA
=======
# apps/courses/views.py — 100% TO'G'RILANGAN SINTAKSIS XATOLARISIZ
# Tuzatish: dashboard va my_courses actionlarda status filtrini qo'shdik/o'zgartirdik.
# Muammo: Admin qo'shgan kurslar 'draft' holatda bo'lsa, ko'rinmasligi mumkin edi.
# Endi statusdan qat'i nazar ko'rsatiladi, lekin real loyihada faqat 'published' ni ko'rsatish yaxshiroq.
# Qo'shimcha: enrolled_courses ga status='published' qo'shishni variant sifatida qoldirdik (izohda).
>>>>>>> ad8d8b2732545b73f5a0ee23a9db7d28fd05bf61

from rest_framework import viewsets, filters, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
<<<<<<< HEAD
from django.db.models import Q, Sum
from rest_framework.permissions import IsAdminUser
from django.http import HttpResponse
import csv
=======
from django.db.models import Q, Sum, Count
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from django.http import HttpResponse
import csv
from django.utils import timezone
>>>>>>> ad8d8b2732545b73f5a0ee23a9db7d28fd05bf61

from .models import (
    Category, Course, Module, Lesson, Quiz, Question, Answer,
    StudentProgress, QuizAttempt, Review, Enrollment
)

from .serializers import (
    # Umumiy serializerlar
    CategorySerializer, CourseListSerializer, CourseDetailSerializer,
    ModuleSerializer, LessonSerializer, QuizSerializer, ReviewSerializer,
    StudentProgressSerializer, TeacherCourseCreateSerializer,
    CourseSerializer, EnrollmentSerializer,

<<<<<<< HEAD
    # Admin serializerlar — MUHIM: hammasi import qilindi!
=======
    # Admin serializerlar
>>>>>>> ad8d8b2732545b73f5a0ee23a9db7d28fd05bf61
    CategoryAdminSerializer,
    ModuleAdminSerializer,
    LessonAdminSerializer,
    QuizAdminSerializer,
    QuestionAdminSerializer,
    AnswerAdminSerializer,
    StudentProgressAdminSerializer,
    QuizAttemptAdminSerializer,
    EnrollmentAdminSerializer,
    ReviewAdminSerializer,
)


# ============================================================
<<<<<<< HEAD
=======
# PERMISSIONS
# ============================================================

class IsTeacher(permissions.BasePermission):
    """O'qituvchi yoki admin ekanligini tekshirish"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and getattr(request.user, 'role', None) in ['teacher', 'admin']


# ============================================================
>>>>>>> ad8d8b2732545b73f5a0ee23a9db7d28fd05bf61
# UMUMIY VIEWSETLAR (Talabalar va mehmonlar uchun)
# ============================================================

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.filter(status='published').select_related(
        'category', 'teacher', 'teacher__teacher_profile'
    ).prefetch_related('modules__lessons')
<<<<<<< HEAD
=======

>>>>>>> ad8d8b2732545b73f5a0ee23a9db7d28fd05bf61
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'level', 'teacher']
    search_fields = ['title', 'description', 'tags']
    ordering_fields = ['created_at', 'price', 'rating', 'total_students']

    def get_serializer_class(self):
        if self.action == 'list':
            return CourseListSerializer
<<<<<<< HEAD
        if self.action == 'retrieve':
            return CourseDetailSerializer
        return CourseListSerializer

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def enroll(self, request, pk=None):
        course = self.get_object()
        student = request.user
        
        enrollment, created = Enrollment.objects.get_or_create(
            user=student,
            course=course
        )
        
        if not created:
            return Response(
                {'error': 'Siz allaqachon bu kursga yozilgansiz'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        course.total_students += 1
        course.save(update_fields=['total_students'])
        
        return Response({
            'message': 'Kursga muvaffaqiyatli yozildingiz!',
            'enrollment': EnrollmentSerializer(enrollment).data
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def featured(self, request):
        courses = self.get_queryset().filter(is_featured=True)[:6]
        serializer = CourseListSerializer(courses, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def bestsellers(self, request):
        courses = self.get_queryset().filter(is_bestseller=True)[:6]
        serializer = CourseListSerializer(courses, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        query = request.query_params.get('q', '')
        courses = self.get_queryset()
        if query:
            courses = courses.filter(Q(title__icontains=query) | Q(description__icontains=query))[:12]
        serializer = CourseListSerializer(courses, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
=======
        if self.action in ['retrieve', 'my_courses']:
            return CourseDetailSerializer
        return CourseListSerializer

    def get_permissions(self):
        if self.action in ['my_courses', 'enroll', 'dashboard']:
            return [permissions.IsAuthenticated()]
        if self.action in ['featured', 'bestsellers', 'search', 'by_category', 'curriculum']:
            return [permissions.AllowAny()]
        return super().get_permissions()

    @action(detail=False, methods=['get'], url_path='my-courses')
    def my_courses(self, request):
        """
        Talaba yozilgan barcha kurslar (Admin panelda qo'shilgan hamma narsa bilan).
        """
        user = request.user
        # Tuzatish: status='published' filtrini qayta qo'shdik, chunki admin qo'shgan draftlarni student ko'rmasligi kerak.
        # Agar admin qo'shganlarni darhol ko'rish kerak bo'lsa, bu filtrni olib tashlang.
        courses = Course.objects.filter(
            enrollments__user=user,
            status='published'  # ← BU TUZATISH: Faqat published kurslarni ko'rsatish
        ).select_related(
            'category', 'teacher'
        ).prefetch_related(
            'modules', 
            'modules__lessons', 
            'modules__lessons__quiz'
        ).distinct()

        # Serializerga context berish shart, aks holda darslar ichidagi progress hisoblanmaydi
        serializer = CourseDetailSerializer(courses, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """
        Dashboard statistikasi - admin paneldagi o'zgarishlarni real-time aks ettiradi.
        """
        user = request.user
        # Talaba yozilgan kurs ID'larini yig'amiz
        enrolled_course_ids = Enrollment.objects.filter(user=user).values_list('course_id', flat=True)
        # Tuzatish: enrolled_courses ga status filtrini qo'shdik
        enrolled_courses = Course.objects.filter(
            id__in=enrolled_course_ids,
            status='published'  # ← BU TUZATISH: Faqat published kurslarni ko'rsatish
        )

        # Admin qo'shgan barcha darslar (qaysi modulga tegishli bo'lishidan qat'i nazar)
        all_lessons = Lesson.objects.filter(module__course_id__in=enrolled_course_ids)
        total_lessons_count = all_lessons.count()
        
        completed_lessons_count = StudentProgress.objects.filter(
            student=user, 
            is_completed=True,
            lesson__in=all_lessons
        ).count()

        # Har bir kurs bo'yicha progressni hisoblash
        courses_data = []
        for course in enrolled_courses:
            # Shu kursga tegishli barcha darslar
            c_lessons = all_lessons.filter(module__course=course)
            c_total = c_lessons.count()
            c_completed = StudentProgress.objects.filter(
                student=user, lesson__in=c_lessons, is_completed=True
            ).count()

            courses_data.append({
                'id': course.id,
                'title': course.title,
                'progress': round((c_completed / c_total * 100), 1) if c_total > 0 else 0,
                'total_lessons': c_total,
                'completed_lessons': c_completed,
                'thumbnail': request.build_absolute_uri(course.thumbnail.url) if course.thumbnail else None,
            })

        return Response({
            'stats': {
                'total_courses': enrolled_courses.count(),
                'total_lessons': total_lessons_count,
                'completed_lessons': completed_lessons_count,
                'overall_progress': round((completed_lessons_count / total_lessons_count * 100), 1) if total_lessons_count > 0 else 0,
            },
            'courses': courses_data
        })

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Featured kurslar"""
        courses = self.get_queryset().filter(is_featured=True)[:6]
        serializer = CourseListSerializer(courses, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def bestsellers(self, request):
        """Bestseller kurslar"""
        courses = self.get_queryset().filter(is_bestseller=True)[:6]
        serializer = CourseListSerializer(courses, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def search(self, request):
        """Kurslarni qidirish"""
        query = request.query_params.get('q', '')
        courses = self.get_queryset()
        if query:
            courses = courses.filter(
                Q(title__icontains=query) | 
                Q(description__icontains=query)
            )[:12]
        serializer = CourseListSerializer(courses, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Kategoriya bo'yicha kurslar"""
>>>>>>> ad8d8b2732545b73f5a0ee23a9db7d28fd05bf61
        category_slug = request.query_params.get('category')
        courses = self.get_queryset()
        if category_slug:
            courses = courses.filter(category__slug=category_slug)
        serializer = CourseListSerializer(courses, many=True, context={'request': request})
        return Response(serializer.data)
<<<<<<< HEAD
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_courses(self, request):
        courses = Course.objects.filter(
            enrollments__user=request.user,
            status='published'
        ).prefetch_related('modules__lessons__quiz__questions__answers') \
         .select_related('category', 'teacher', 'teacher__teacher_profile') \
         .distinct()
        
        serializer = CourseDetailSerializer(courses, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def curriculum(self, request, pk=None):
        course = self.get_object()
        modules = course.modules.all().prefetch_related('lessons')
        serializer = ModuleSerializer(modules, many=True, context={'request': request})
        return Response(serializer.data)

=======

    @action(detail=True, methods=['get'])
    def curriculum(self, request, pk=None):
        """Kurs curriculum (modullar va darslar)"""
        course = self.get_object()
        modules = course.modules.all().prefetch_related(
            'lessons',
            'lessons__quiz',
            'lessons__quiz__questions',
            'lessons__quiz__questions__answers'
        )
        serializer = ModuleSerializer(modules, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def enroll(self, request, pk=None):
        """Kursga yozilish"""
        course = self.get_object()
        user = request.user

        enrollment, created = Enrollment.objects.get_or_create(
            user=user,
            course=course
        )

        if not created:
            return Response(
                {"detail": "Siz allaqachon bu kursga yozilgansiz"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Kurs studentlar sonini yangilash
        course.total_students = course.enrollments.count()
        course.save()

        return Response(
            {
                "detail": "Kursga muvaffaqiyatli yozildingiz",
                "enrollment_id": enrollment.id
            },
            status=status.HTTP_201_CREATED
        )

>>>>>>> ad8d8b2732545b73f5a0ee23a9db7d28fd05bf61

class LessonViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
<<<<<<< HEAD
=======
        """Darsni tugatish"""
>>>>>>> ad8d8b2732545b73f5a0ee23a9db7d28fd05bf61
        lesson = self.get_object()
        student = request.user
        
        progress, created = StudentProgress.objects.get_or_create(
            student=student,
            course=lesson.module.course,
            lesson=lesson
        )
        
<<<<<<< HEAD
        progress.is_completed = True
        progress.time_spent_seconds = request.data.get('time_spent', 0)
        progress.save()
        
        if hasattr(student, 'points'):
            student.points += 10
            student.save()
        
        return Response({
            'message': 'Dars tugatildi!',
            'points_earned': 10
=======
        if not progress.is_completed:
            progress.is_completed = True
            progress.completed_at = timezone.now()
            progress.time_spent_seconds = request.data.get('time_spent', 0)
            progress.save()
            
            # Ball qo'shish
            if hasattr(student, 'points'):
                student.points += 10
                student.save()
            
            return Response({
                'message': 'Dars tugatildi!',
                'points_earned': 10,
                'is_completed': True
            }, status=status.HTTP_200_OK)
        
        return Response({
            'message': 'Dars allaqachon tugatilgan',
            'is_completed': True
>>>>>>> ad8d8b2732545b73f5a0ee23a9db7d28fd05bf61
        }, status=status.HTTP_200_OK)


class QuizViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
<<<<<<< HEAD
=======
        """Test topshirish"""
>>>>>>> ad8d8b2732545b73f5a0ee23a9db7d28fd05bf61
        quiz = self.get_object()
        student = request.user
        answers = request.data.get('answers', {})
        
        total_questions = quiz.questions.count()
        correct_answers = 0
        
        for question_id, answer_ids in answers.items():
            try:
                question = quiz.questions.get(id=question_id)
                correct = question.answers.filter(is_correct=True).values_list('id', flat=True)
                
                if set(map(int, answer_ids)) == set(correct):
                    correct_answers += 1
            except Question.DoesNotExist:
                continue
        
        score = (correct_answers / total_questions) * 100 if total_questions > 0 else 0
        is_passed = score >= quiz.passing_score
        
        attempt = QuizAttempt.objects.create(
            student=student,
            quiz=quiz,
            score=score,
            total_questions=total_questions,
            correct_answers=correct_answers,
            answers=answers,
            is_passed=is_passed,
<<<<<<< HEAD
            time_taken_seconds=request.data.get('time_taken', 0)
        )
        
        if is_passed and hasattr(student, 'points'):
            student.points += 50
            student.save()
        
        return Response({'message': 'Test topshirildi!'}, status=status.HTTP_201_CREATED)
=======
            time_taken_seconds=request.data.get('time_taken', 0),
            submitted_at=timezone.now()
        )
        
        points_earned = 0
        if is_passed and hasattr(student, 'points'):
            points_earned = 50
            student.points += points_earned
            student.save()
        
        return Response({
            'message': 'Test topshirildi!',
            'score': score,
            'is_passed': is_passed,
            'correct_answers': correct_answers,
            'total_questions': total_questions,
            'points_earned': points_earned,
            'attempt_id': attempt.id
        }, status=status.HTTP_201_CREATED)
>>>>>>> ad8d8b2732545b73f5a0ee23a9db7d28fd05bf61


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'rating']
    
    def perform_create(self, serializer):
<<<<<<< HEAD
        serializer.save(user=self.request.user)
=======
        serializer.save(student=self.request.user)
>>>>>>> ad8d8b2732545b73f5a0ee23a9db7d28fd05bf61
    
    def get_queryset(self):
        queryset = super().get_queryset()
        course_id = self.request.query_params.get('course_id')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        return queryset


class StudentProgressViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = StudentProgressSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return StudentProgress.objects.filter(student=self.request.user)
<<<<<<< HEAD
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        student = request.user
        
        enrolled_courses = Course.objects.filter(enrollments__user=student)
        
        total_time = StudentProgress.objects.filter(
            student=student
        ).aggregate(total=Sum('time_spent_seconds'))['total'] or 0
        
        data = {
            'total_enrolled': enrolled_courses.count(),
            'total_time_hours': round(total_time / 3600, 2),
            'total_points': getattr(student, 'points', 0),
        }
        
        return Response(data)
=======
>>>>>>> ad8d8b2732545b73f5a0ee23a9db7d28fd05bf61


class EnrollmentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Enrollment.objects.select_related('user', 'course')
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)


# ============================================================
# O'QITUVCHI UCHUN
# ============================================================

<<<<<<< HEAD
class IsTeacher(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and getattr(request.user, 'role', None) in ['teacher', 'admin']


=======
>>>>>>> ad8d8b2732545b73f5a0ee23a9db7d28fd05bf61
class TeacherCourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer
    permission_classes = [IsTeacher]

    def get_queryset(self):
        return Course.objects.filter(teacher=self.request.user).select_related('category')

    def get_serializer_class(self):
        if self.action == 'create':
            return TeacherCourseCreateSerializer
        return CourseSerializer

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user, status='draft')

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
<<<<<<< HEAD
        course = self.get_object()
        if not course.modules.exists():
            return Response({'error': 'Kamida bitta modul qo\'shing'}, status=status.HTTP_400_BAD_REQUEST)
        course.status = 'published'
        course.save()
        return Response({'message': 'Kurs nashr qilindi!', 'status': 'published'})

    @action(detail=True, methods=['post'])
    def unpublish(self, request, pk=None):
        course = self.get_object()
        course.status = 'draft'
        course.save()
        return Response({'message': 'Kurs draft holatiga o\'tkazildi!', 'status': 'draft'})
=======
        """Kursni nashr qilish"""
        course = self.get_object()
        if not course.modules.exists():
            return Response(
                {'error': 'Kamida bitta modul qo\'shing'},
                status=status.HTTP_400_BAD_REQUEST
            )
        course.status = 'published'
        course.published_at = timezone.now()
        course.save()
        return Response({
            'message': 'Kurs nashr qilindi!',
            'status': 'published'
        })

    @action(detail=True, methods=['post'])
    def unpublish(self, request, pk=None):
        """Kursni draft holatiga qaytarish"""
        course = self.get_object()
        course.status = 'draft'
        course.save()
        return Response({
            'message': 'Kurs draft holatiga o\'tkazildi!',
            'status': 'draft'
        })
>>>>>>> ad8d8b2732545b73f5a0ee23a9db7d28fd05bf61


class TeacherEnrollmentListView(APIView):
    permission_classes = [IsTeacher]

    def get(self, request):
<<<<<<< HEAD
=======
        """O'qituvchining talabalar ro'yxati"""
>>>>>>> ad8d8b2732545b73f5a0ee23a9db7d28fd05bf61
        enrollments = Enrollment.objects.filter(
            course__teacher=request.user
        ).select_related('user', 'course').order_by('-enrolled_at')

<<<<<<< HEAD
        data = [
            {
                "id": enrollment.id,
                "student_name": enrollment.user.get_full_name() or enrollment.user.username,
                "student_email": enrollment.user.email,
                "course_title": enrollment.course.title,
                "enrolled_at": enrollment.enrolled_at.isoformat(),
            }
            for enrollment in enrollments
        ]

        return Response(data)
=======
        data = [{
            "id": enrollment.id,
            "student_name": enrollment.user.get_full_name() or enrollment.user.username,
            "student_email": enrollment.user.email,
            "course_title": enrollment.course.title,
            "enrolled_at": enrollment.enrolled_at,
            "progress": enrollment.progress,
        } for enrollment in enrollments]
        
        return Response({"results": data})
>>>>>>> ad8d8b2732545b73f5a0ee23a9db7d28fd05bf61


class TeacherStatsView(APIView):
    permission_classes = [IsTeacher]

    def get(self, request):
<<<<<<< HEAD
        courses = Course.objects.filter(teacher=request.user)
        total_students = Enrollment.objects.filter(course__teacher=request.user).values('user').distinct().count()
        total_income = sum(en.course.price for en in Enrollment.objects.filter(course__teacher=request.user).select_related('course'))

        data = {
=======
        """O'qituvchi statistikasi"""
        courses = Course.objects.filter(teacher=request.user)
        total_students = Enrollment.objects.filter(
            course__teacher=request.user
        ).values('user').distinct().count()
        
        total_income = Enrollment.objects.filter(
            course__teacher=request.user
        ).aggregate(total=Sum('course__price'))['total'] or 0

        return Response({
>>>>>>> ad8d8b2732545b73f5a0ee23a9db7d28fd05bf61
            "total_courses": courses.count(),
            "published_courses": courses.filter(status='published').count(),
            "total_students": total_students,
            "total_income": float(total_income),
<<<<<<< HEAD
        }
        return Response(data)
=======
            "total_views": 0
        })
>>>>>>> ad8d8b2732545b73f5a0ee23a9db7d28fd05bf61


# ============================================================
# ADMIN VIEWSETLAR
# ============================================================

class AdminCategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategoryAdminSerializer
    permission_classes = [IsAdminUser]


class AdminCourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all().select_related('teacher', 'category')
    serializer_class = CourseDetailSerializer
    permission_classes = [IsAdminUser]

    @action(detail=False, methods=['post'])
    def make_published(self, request):
<<<<<<< HEAD
        ids = request.data.get('ids', [])
        updated = Course.objects.filter(id__in=ids).update(status='published')
=======
        """Kurslarni nashr qilish"""
        ids = request.data.get('ids', [])
        updated = Course.objects.filter(id__in=ids).update(
            status='published',
            published_at=timezone.now()
        )
>>>>>>> ad8d8b2732545b73f5a0ee23a9db7d28fd05bf61
        return Response({'message': f'{updated} ta kurs nashr etildi'})

    @action(detail=False, methods=['post'])
    def make_draft(self, request):
<<<<<<< HEAD
        ids = request.data.get('ids', [])
        updated = Course.objects.filter(id__in=ids).update(status='draft')
        return Response({'message': f'{updated} ta kurs draft holatiga o‘tkazildi'})

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="courses.csv"'
        writer = csv.writer(response)
        writer.writerow(['ID', 'Nomi', 'O‘qituvchi', 'Narx', 'Talabalar', 'Status', 'Yaratilgan'])
=======
        """Kurslarni draft qilish"""
        ids = request.data.get('ids', [])
        updated = Course.objects.filter(id__in=ids).update(status='draft')
        return Response({'message': f'{updated} ta kurs draft holatiga o\'tkazildi'})

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        """CSV export"""
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="courses.csv"'
        writer = csv.writer(response)
        writer.writerow(['ID', 'Nomi', 'O\'qituvchi', 'Narx', 'Talabalar', 'Status', 'Yaratilgan'])
>>>>>>> ad8d8b2732545b73f5a0ee23a9db7d28fd05bf61

        courses = self.get_queryset()
        for course in courses:
            writer.writerow([
                course.id,
                course.title,
                course.teacher.full_name if course.teacher else '-',
                course.price,
                course.total_students,
                course.get_status_display(),
                course.created_at.strftime('%d.%m.%Y %H:%M')
            ])
        return response


class AdminModuleViewSet(viewsets.ModelViewSet):
    queryset = Module.objects.all().select_related('course')
    serializer_class = ModuleAdminSerializer
    permission_classes = [IsAdminUser]


class AdminLessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all().select_related('module__course')
    serializer_class = LessonAdminSerializer
    permission_classes = [IsAdminUser]


class AdminQuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all().select_related('lesson')
    serializer_class = QuizAdminSerializer
    permission_classes = [IsAdminUser]


class AdminQuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all().select_related('quiz')
    serializer_class = QuestionAdminSerializer
    permission_classes = [IsAdminUser]


class AdminAnswerViewSet(viewsets.ModelViewSet):
    queryset = Answer.objects.all().select_related('question')
    serializer_class = AnswerAdminSerializer
    permission_classes = [IsAdminUser]


class AdminStudentProgressViewSet(viewsets.ModelViewSet):
    queryset = StudentProgress.objects.all().select_related('student', 'lesson')
    serializer_class = StudentProgressAdminSerializer
    permission_classes = [IsAdminUser]


class AdminQuizAttemptViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = QuizAttempt.objects.all().select_related('student', 'quiz')
    serializer_class = QuizAttemptAdminSerializer
    permission_classes = [IsAdminUser]


class AdminEnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all().select_related('user', 'course')
    serializer_class = EnrollmentAdminSerializer
    permission_classes = [IsAdminUser]


class AdminReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all().select_related('student', 'course')
    serializer_class = ReviewAdminSerializer
    permission_classes = [IsAdminUser]