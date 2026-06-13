from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status

from apps.users.models import User, StudentProfile

class UserAuthTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('auth-register')
        self.login_url = reverse('auth-login')
        
        self.user_data = {
            'phone': '+998901234567',
            'full_name': 'Test User',
            'father_name': 'Test Father',
            'password': '1234',
            'password2': '1234',
            'role': 'student'
        }
    
    def test_user_registration(self):
        response = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', response.data)
        self.assertIn('user', response.data)
        
        # Check user created
        user = User.objects.get(phone='+998901234567')
        self.assertEqual(user.full_name, 'Test User')
        self.assertEqual(user.role, 'student')
        
        # Check student profile created
        self.assertTrue(hasattr(user, 'student_profile'))
    
    def test_user_login(self):
        # Create user first
        user = User.objects.create(
            phone='+998901234567',
            full_name='Test User',
            role='student'
        )
        user.set_password('1234')
        user.save()
        
        # Login
        response = self.client.post(self.login_url, {
            'phone': '+998901234567',
            'password': '1234'
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])
        self.assertIn('refresh', response.data['tokens'])
    
    def test_invalid_phone_format(self):
        invalid_data = self.user_data.copy()
        invalid_data['phone'] = '901234567'  # Missing +998
        
        response = self.client.post(self.register_url, invalid_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_password_mismatch(self):
        invalid_data = self.user_data.copy()
        invalid_data['password2'] = '5678'
        
        response = self.client.post(self.register_url, invalid_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_duplicate_phone(self):
        # Create first user
        self.client.post(self.register_url, self.user_data)
        
        # Try to create second user with same phone
        response = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

class AdminStudentManagementTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Create admin user
        self.admin = User.objects.create(
            phone='+998901111111',
            full_name='Admin User',
            role='admin',
            is_staff=True
        )
        self.admin.set_password('admin123')
        self.admin.save()
        
        # Login as admin
        response = self.client.post(reverse('auth-login'), {
            'phone': '+998901111111',
            'password': 'admin123'
        })
        self.token = response.data['tokens']['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
    
    def test_admin_create_student(self):
        url = reverse('admin-students-list')
        data = {
            'phone': '+998902222222',
            'full_name': 'New Student',
            'father_name': 'Student Father',
            'auto_password': True
        }
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('password', response.data)
        
        # Check student created
        student = User.objects.get(phone='+998902222222')
        self.assertEqual(student.role, 'student')
    
    def test_admin_list_students(self):
        # Create some students
        for i in range(5):
            User.objects.create(
                phone=f'+99890333333{i}',
                full_name=f'Student {i}',
                role='student'
            )
        
        url = reverse('admin-students-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 5)