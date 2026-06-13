// src/utils/axiosConfig.js - TUZATILGAN (Refresh token ishlaydi)

import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

// Axios instance yaratish
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - har bir so'rovga token qo'shish
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Token yuborildi');
    } else {
      console.warn('⚠️ Token topilmadi!');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - 401 xatosida qayta login qilish
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Agar 401 xatosi bo'lsa va bu birinchi urinish bo'lsa
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          console.error('❌ Refresh token yo\'q - login sahifasiga yo\'naltirish');
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        console.log('🔄 Refresh token bilan yangilanmoqda...');

        // Refresh token bilan yangi access token olish
        const response = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;
        localStorage.setItem('access_token', newAccessToken);

        console.log('✅ Yangi token olindi');

        // Yangi token bilan qayta urinish
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
        
      } catch (refreshError) {
        // Refresh token ham ishlamasa, logout
        console.error('❌ Refresh token xatosi:', refreshError);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;