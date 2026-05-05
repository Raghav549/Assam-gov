// ============================================
// API SERVICE - HTTP CLIENT
// ============================================

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const loginAPI = (credentials) => apiClient.post('/auth/login', credentials);
export const registerAPI = (userData) => apiClient.post('/auth/register', userData);
export const forgotPasswordAPI = (email) => apiClient.post('/auth/forgot-password', { email });

// OTP APIs
export const sendOTPAPI = (email) => apiClient.post('/otp/send', { email });
export const verifyOTPAPI = (data) => apiClient.post('/otp/verify', data);
export const resendOTPAPI = (email) => apiClient.post('/otp/resend', { email });

// Notification APIs
export const getNotificationsAPI = () => apiClient.get('/notifications');
export const markNotificationReadAPI = (id) => apiClient.put(`/notifications/${id}/read`);
export const markAllNotificationsReadAPI = () => apiClient.put('/notifications/read-all');

export default apiClient;
