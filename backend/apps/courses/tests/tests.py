from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from apps.courses.models import Course, Category, Module, Lesson
from apps.users.models import User
from apps.courses.models import Enrollment  # muhim import!


class CourseTests(APITestCase):
    def setUp(self):
        self.client = APIClient()

        # Teacher yaratish
        self.teacher = User.objects.create_user(
            username='teacher1',
            phone='+998901111111',
            full_name='Teacher User',
            role='teacher',
            password='teacher123'
        )

        # Student yaratish
        self.student = User.objects.create_user(
            username='student1',
            phone='+998902222222',
            full_name='Student User',
            role='student',
            password='student123'
        )

        # Category
        self.category = Category.objects.create(
            name='Programming',
            slug='programming'
        )

        # Course
        self.course = Course.objects.create(
            title='Python Basics',
            slug='python-basics',
            short_description='Python course',
            teacher=self.teacher,
            category=self.category,
            price=500000,
            level='beginner',
            status='published'
        )

    def test_list_courses(self):
        url = reverse('courses:course-list')  # agar app_name = 'courses' bo'lsa
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_course_detail(self):
        url = reverse('courses:course-detail', kwargs={'pk': self.course.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Python Basics')

    def test_course_enrollment_authenticated(self):
        # Student bilan login
        login_url = reverse('users:student-login')  # sizning url nomingizga moslashtiring!
        login_data = {
            'phone': '+998902222222',
            'password': 'student123'
        }
        login_response = self.client.post(login_url, login_data)
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)

        token = login_response.data['access']  # sizning javobda 'access' bor
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        # Enroll qilish
        enroll_url = reverse('courses:course-enroll', kwargs={'pk': self.course.pk})
        response = self.client.post(enroll_url)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('message', response.data)
        self.assertEqual(response.data['message'], 'Kursga muvaffaqiyatli yozildingiz!')

        # Enrollment mavjudligini tekshirish
        self.assertTrue(
            Enrollment.objects.filter(user=self.student, course=self.course).exists()
        )

    def test_course_enrollment_unauthenticated(self):
        url = reverse('courses:course-enroll', kwargs={'pk': self.course.pk})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_course_search(self):
        url = reverse('courses:course-list') + '?search=Python'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_course_filter_by_level(self):
        url = reverse('courses:course-list') + '?level=beginner'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for course in response.data:
            self.assertEqual(course['level'], 'beginner')