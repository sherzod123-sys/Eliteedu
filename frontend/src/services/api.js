import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ================= TOKEN =================
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ================= REFRESH (SINGLE-FLIGHT) =================
let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
};

const onRefreshFailed = (err) => {
  refreshSubscribers.forEach((cb) => cb(null, err));
  refreshSubscribers = [];
};

const doLogout = () => {
  localStorage.clear();
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // Refresh endpointining o'zi 401 qaytarsa — to'g'ridan-to'g'ri logout
    if (original?.url?.includes('/auth/token/refresh/')) {
      isRefreshing = false;
      onRefreshFailed(error);
      doLogout();
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      // Agar boshqa so'rov allaqachon refresh qilayotgan bo'lsa — navbatga qo'shamiz
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken, err) => {
            if (err || !newToken) {
              reject(error);
              return;
            }
            original.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(original));
          });
        });
      }

      isRefreshing = true;

      try {
        const refresh = localStorage.getItem('refresh_token');
        if (!refresh) throw new Error('No refresh token');

        const { data } = await axios.post(
          `${API_URL}/auth/token/refresh/`,
          { refresh }
        );

        localStorage.setItem('access_token', data.access);
        if (data.refresh) {
          localStorage.setItem('refresh_token', data.refresh);
        }

        isRefreshing = false;
        onRefreshed(data.access);

        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch (e) {
        isRefreshing = false;
        onRefreshFailed(e);
        doLogout();
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  }
);

// ================= AUTH =================
export const authAPI = {
  loginStudent: (data) => api.post('/users/student-login/', data),
  loginTeacher: (data) => api.post('/users/teacher-login/', data),
  register: (data) => api.post('/users/register/', data),
  me: () => api.get('/users/me/'),
  update: (data) => api.patch('/users/me/', data),
  logout: () => {
    localStorage.clear();
    window.location.href = '/login';
  },
};

// ================= COURSES =================
export const coursesAPI = {
  getAll: () => api.get('/courses/'),
  getById: (id) => api.get(`/courses/${id}/`),
  my: () => api.get('/enrollments/'),
  enroll: (id) => api.post(`/courses/${id}/enroll/`),
};

// ================= CHAT (FIXED) =================
export const chatAPI = {
  getRooms: () => api.get('/chat/rooms/'),

  getMessages: (roomId) =>
    api.get(`/chat/rooms/${roomId}/messages/`),

  // ❗ FIX: SEND ENDPOINT (ENG MUHIM)
  sendMessage: (roomId, formData) =>
    api.post(`/chat/rooms/${roomId}/send/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  deleteMessage: (id) =>
    api.delete(`/chat/messages/${id}/`),

  forward: (id, roomId) =>
    api.post(`/chat/messages/${id}/forward/`, { room_id: roomId }),

  react: (id, emoji) =>
    api.post(`/chat/messages/${id}/react/`, { emoji }),

  pin: (roomId, messageId) =>
    api.post(`/chat/rooms/${roomId}/pin/`, { message_id: messageId }),

  unread: () => api.get('/chat/unread/'),
};

// ================= VOICE SEND (READY FUNCTION) =================
export const sendVoice = async (roomId, audioBlob, duration, replyToId = null) => {
  const ext = audioBlob.type.includes('ogg') ? 'ogg' : 'webm';

  const formData = new FormData();
  formData.append(
    'file',
    new File([audioBlob], `voice_${Date.now()}.${ext}`, {
      type: audioBlob.type,
    })
  );

  formData.append('message_type', 'voice');
  formData.append('content', '');
  formData.append('duration', duration);

  if (replyToId) {
    formData.append('reply_to_id', replyToId);
  }

  return await chatAPI.sendMessage(roomId, formData);
};

export default api;