// src/services/api.js

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

// Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor — access token qo'shish
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — 401 bo'lganda token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('Refresh token yo‘q');

        const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh ishlamasa — logout
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user'); // agar saqlagan bo'lsangiz
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ==================== AUTH API ====================
export const authAPI = {
  // Talaba kirishi — telefon bilan
  studentLogin: (credentials) =>
    api.post('/users/student-login/', credentials),

  // O'qituvchi kirishi — username yoki email bilan
  teacherLogin: (credentials) =>
    api.post('/users/teacher-login/', credentials),

  // Ro'yxatdan o'tish (talabalar uchun)
  register: (data) =>
    api.post('/users/register/', data), // yoki sizda '/auth-user/register/' bo'lsa o'zgartiring

  // Joriy foydalanuvchi profilini olish
  getProfile: () =>
    api.get('/users/me/'), // yoki '/auth-user/me/' — backendga qarab

  // Profilni yangilash
  updateProfile: (data) =>
    api.patch('/users/me/', data),

  // Chiqish (faqat local tozalash)
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },
};

// ==================== COURSES API ====================
export const coursesAPI = {
  getAll: (params = {}) => api.get('/courses/', { params }),
  getById: (id) => api.get(`/courses/${id}/`),
  getCurriculum: (id) => api.get(`/courses/${id}/curriculum/`),
  enroll: (id) => api.post(`/courses/${id}/enroll/`),
  getMyCourses: () => api.get('/courses/my-courses/'),
  getFeatured: () => api.get('/courses/featured/'),
  getBestsellers: () => api.get('/courses/bestsellers/'),
  getCategories: () => api.get('/courses/categories/'),
};

// ==================== LESSONS API ====================
export const lessonsAPI = {
  getById: (id) => api.get(`/lessons/${id}/`),
  complete: (id, data) => api.post(`/lessons/${id}/complete/`, data),
};

// ==================== QUIZ API ====================
export const quizAPI = {
  getById: (id) => api.get(`/quizzes/${id}/`),
  submit: (id, data) => api.post(`/quizzes/${id}/submit/`, data),
};

// ==================== TEACHER API ====================
export const teacherAPI = {
  getCourses: () => api.get('/teacher/courses/'),
  getStats: () => api.get('/teacher/courses/stats/'),
  createCourse: (data) => api.post('/teacher/courses/', data),
  updateCourse: (id, data) => api.patch(`/teacher/courses/${id}/`, data),
  deleteCourse: (id) => api.delete(`/teacher/courses/${id}/`),
};

// ==================== BLOG API ====================
export const blogAPI = {
  getAll: (params = {}) => api.get('/blog/', { params }),
  getById: (id) => api.get(`/blog/${id}/`),
  createPost: (data) => api.post('/blog/posts/', data),
  updatePost: (id, data) => api.patch(`/blog/posts/${id}/`, data),
  deletePost: (id) => api.delete(`/blog/posts/${id}/`),
};

// ==================== PROGRESS API ====================
export const progressAPI = {
  getDashboard: () => api.get('/progress/dashboard/'),
};

// Eksport qilish
export default api;