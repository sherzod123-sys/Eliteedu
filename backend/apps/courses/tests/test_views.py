from django.test import TestCase
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse
from apps.courses.models import Course, Category, Module, Lesson

from apps.users.models import User

class CourseTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Create teacher
        self.teacher = User.objects.create(
            phone='+998903333333',
            full_name='Teacher User',
            role='teacher'
        )
        self.teacher.set_password('teacher123')
        self.teacher.save()
        
        # Create student
        self.student = User.objects.create(
            phone='+998904444444',
            full_name='Student User',
            role='student'
        )
        self.student.set_password('student123')
        self.student.save()
        
        # Create category
        self.category = Category.objects.create(
            name='Programming',
            slug='programming'
        )
        
        # Create course
        self.course = Course.objects.create(
            title='Python Basics',
            slug='python-basics',
            description='Learn Python from scratch',
            short_description='Python course',
            teacher=self.teacher,
            category=self.category,
            price=500000,
            level='beginner',
            status='published'
        )
    
    def test_list_courses(self):
        url = reverse('course-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
    
    def test_course_detail(self):
        url = reverse('course-detail', kwargs={'pk': self.course.id})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Python Basics')
    
    def test_course_enrollment(self):
        # Login as student
        login_response = self.client.post(reverse('auth-login'), {
            'phone': '+998904444444',
            'password': 'student123'
        })
        token = login_response.data['tokens']['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        # Enroll
        url = reverse('course-enroll', kwargs={'pk': self.course.id})
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        
        # Check enrollment
        self.course.refresh_from_db()
        self.assertTrue(self.course.enrolled_students.filter(id=self.student.id).exists())
    
    def test_course_search(self):
        url = f"{reverse('course-list')}?search=Python"
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
    
    def test_course_filter_by_level(self):
        url = f"{reverse('course-list')}?level=beginner"
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for course in response.data:
            self.assertEqual(course['level'], 'beginner')