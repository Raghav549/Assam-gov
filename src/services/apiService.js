// ============================================
// API SERVICE - HTTP CLIENT (authenticated backend calls)
// ============================================
import axios from 'axios';
import { API_BASE_URL } from './config';
import { getAuthToken, clearSession } from './session';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 70000,
  headers: { 'Content-Type': 'application/json' }
});

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only an expired/invalid session on an authenticated call should log the user out.
    if (error.response?.status === 401 && error.config?.headers?.Authorization) {
      clearSession();
      if (!window.location.pathname.startsWith('/login')) window.location.assign('/login');
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const loginAPI = (credentials) => apiClient.post('/auth/login', credentials);
export const registerAPI = (userData) => apiClient.post('/auth/register', userData);
export const meAPI = () => apiClient.get('/auth/me');
export const forgotPasswordAPI = (email) => apiClient.post('/auth/forgot-password', { email });
export const resetPasswordAPI = (data) => apiClient.post('/auth/reset-password', data);

// OTP APIs
export const sendOTPAPI = (email) => apiClient.post('/otp/send', { email });
export const verifyOTPAPI = (data) => apiClient.post('/otp/verify', data);
export const resendOTPAPI = (email) => apiClient.post('/otp/resend', { email });

export default apiClient;
