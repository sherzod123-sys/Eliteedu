// src/utils/axiosConfig.js — FINAL VA TOʻLIQ ISHLAYDIGAN VERSIYA

import axios from 'axios';

const API_BASE_URL = '';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  // Content-Type ni bu yerda qoʻshmaymiz!
  // FormData bilan yuborilganda avtomatik multipart/form-data boʻladi
});

// Request interceptor — token qo'shish
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Agar FormData yuborilayotgan bo'lsa, Content-Type ni o'chirib qo'yamiz
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']; // Axios avtomatik boundary qo'shadi
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — 401 da refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;
        localStorage.setItem('access_token', newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;