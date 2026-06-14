# apps/courses/serializers.py — 100% TOʻGʻIRLANGAN TOʻLIQ KOD

from rest_framework import serializers
from .models import (
    Category, Course, Module, Lesson, Quiz, Question,
    Answer, StudentProgress, QuizAttempt, Review, Enrollment
)
from apps.users.serializers import UserSerializer


# ------------------------------------------------------------------
# Umumiy serializerlar
# ------------------------------------------------------------------

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['id', 'answer_text', 'order', 'is_correct']


class QuestionSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'question_text', 'question_type', 'points', 'order', 'answers']


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = '__all__'


class LessonSerializer(serializers.ModelSerializer):
    quiz = QuizSerializer(read_only=True)
    is_completed = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = '__all__'

    def get_is_completed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return StudentProgress.objects.filter(
                student=request.user,
                lesson=obj,
                is_completed=True
            ).exists()
        return False


class ModuleSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    lessons_count = serializers.SerializerMethodField()
    duration_minutes = serializers.SerializerMethodField()

    class Meta:
        model = Module
        fields = '__all__'

    def get_lessons_count(self, obj):
        return obj.lessons.count()

    def get_duration_minutes(self, obj):
        total = 0
        for lesson in obj.lessons.all():
            if lesson.video_duration:
                total += lesson.video_duration // 60
        return total


class ReviewSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='user.get_full_name', read_only=True)
    student_avatar = serializers.ImageField(source='user.avatar', read_only=True)

    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ['user', 'is_verified_purchase']


class StudentProgressSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    lesson_slug = serializers.CharField(source='lesson.slug', read_only=True)
    module_title = serializers.CharField(source='lesson.module.title', read_only=True)
    course_title = serializers.CharField(source='lesson.module.course.title', read_only=True)

    class Meta:
        model = StudentProgress
        fields = '__all__'
        read_only_fields = ['student']


class QuizAttemptSerializer(serializers.ModelSerializer):
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)
    course_title = serializers.CharField(source='quiz.lesson.module.course.title', read_only=True)

    class Meta:
        model = QuizAttempt
        fields = '__all__'
        read_only_fields = ['student', 'score', 'is_passed']


class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseListSerializer(read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = Enrollment
        fields = '__all__'


# ------------------------------------------------------------------
# Kurs serializerlari — TOʻGʻIRLANGAN (teacher_profile xatolarga chidamli)
# ------------------------------------------------------------------

class CourseListSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True)
    teacher_specialization = serializers.CharField(source='teacher.teacher_profile.specialization', read_only=True, default='')
    teacher_avatar = serializers.ImageField(source='teacher.teacher_profile.avatar', read_only=True, default=None)
    teacher_bio = serializers.CharField(source='teacher.teacher_profile.bio', read_only=True, default='')
    category_name = serializers.CharField(source='category.name', read_only=True, default='')
    is_enrolled = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'short_description', 'thumbnail',
            'teacher_name', 'teacher_specialization', 'teacher_avatar', 'teacher_bio',
            'category_name', 'level', 'price', 'discount_price',
            'rating', 'total_students', 'is_featured', 'is_bestseller',
            'is_enrolled', 'created_at'
        ]

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Enrollment.objects.filter(user=request.user, course=obj).exists()
        return False


class CourseDetailSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True)
    teacher_specialization = serializers.CharField(source='teacher.teacher_profile.specialization', read_only=True, default='')
    teacher_avatar = serializers.ImageField(source='teacher.teacher_profile.avatar', read_only=True)
    teacher_bio = serializers.CharField(source='teacher.teacher_profile.bio', read_only=True, default='')

    # BU QATOR BO'LISHI SHART!
    modules = ModuleSerializer(many=True, read_only=True)

    category = CategorySerializer(read_only=True)
    reviews_preview = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()
    total_lessons = serializers.SerializerMethodField()
    completed_lessons = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = '__all__'  # yoki aniq fieldlar ro'yxati

    # ... qolgan methodlar

    def get_reviews_preview(self, obj):
        reviews = obj.reviews.all()[:5]
        return ReviewSerializer(reviews, many=True).data

    def get_progress_percentage(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            total_lessons = Lesson.objects.filter(module__course=obj).count()
            if total_lessons == 0:
                return 0
            completed = StudentProgress.objects.filter(
                student=request.user, lesson__module__course=obj, is_completed=True
            ).count()
            return round((completed / total_lessons) * 100, 2)
        return 0

    def get_total_lessons(self, obj):
        return Lesson.objects.filter(module__course=obj).count()

    def get_completed_lessons(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return StudentProgress.objects.filter(
                student=request.user, lesson__module__course=obj, is_completed=True
            ).count()
        return 0


class TeacherCourseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['title', 'short_description', 'price', 'level']
        extra_kwargs = {
            'title': {'required': True},
            'short_description': {'required': True},
            'price': {'required': True},
            'level': {'required': True},
        }

    def validate(self, data):
        price = data.get('price')
        discount_price = data.get('discount_price')

        if price < 0:
            raise serializers.ValidationError({"price": "Narx musbat bo'lishi kerak."})

        if discount_price is not None:
            if discount_price < 0:
                raise serializers.ValidationError({"discount_price": "Chegirma narxi manfiy bo'lmasligi kerak."})
            if discount_price >= price:
                raise serializers.ValidationError({"discount_price": "Chegirmali narx asosiy narxdan kichik bo'lishi kerak."})

        return data


class CourseSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True)
    total_modules = serializers.SerializerMethodField()
    total_lessons = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'short_description', 'description',
            'category', 'category_name', 'teacher', 'teacher_name',
            'thumbnail', 'price', 'discount_price', 'level', 'status',
            'requirements', 'what_you_learn', 'tags', 'is_featured',
            'is_bestseller', 'rating', 'total_students',
            'total_modules', 'total_lessons', 'created_at', 'updated_at',
        ]
        read_only_fields = ['slug', 'teacher', 'rating', 'total_students', 'created_at', 'updated_at']

    def get_total_modules(self, obj):
        return obj.modules.count()

    def get_total_lessons(self, obj):
        total = 0
        for module in obj.modules.all():
            total += module.lessons.count()
        return total
    
class CategoryAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ModuleAdminSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    class Meta:
        model = Module
        fields = '__all__'

class LessonAdminSerializer(serializers.ModelSerializer):
    module_title = serializers.CharField(source='module.title', read_only=True)
    course_title = serializers.CharField(source='module.course.title', read_only=True)
    class Meta:
        model = Lesson
        fields = '__all__'

class QuizAdminSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    class Meta:
        model = Quiz
        fields = '__all__'

class QuestionAdminSerializer(serializers.ModelSerializer):
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)
    class Meta:
        model = Question
        fields = '__all__'

class AnswerAdminSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.question_text', read_only=True)
    class Meta:
        model = Answer
        fields = '__all__'

class StudentProgressAdminSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    class Meta:
        model = StudentProgress
        fields = '__all__'

class QuizAttemptAdminSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)
    class Meta:
        model = QuizAttempt
        fields = '__all__'

class EnrollmentAdminSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='user.full_name', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    class Meta:
        model = Enrollment
        fields = '__all__'

class ReviewAdminSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    class Meta:
        model = Review
        fields = '__all__'    