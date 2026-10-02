// ============================================
// AUTH / EMAIL API CLIENT
// ============================================
import axios from 'axios';
import { API_BASE_URL } from './config';
import { getAuthToken } from './session';

// Render free instances sleep and take ~30-60s to wake up; a 25s timeout made
// the very first "Send OTP" fail even though the email was sent moments later.
const REQUEST_TIMEOUT_MS = 70000;

const http = axios.create({ baseURL: API_BASE_URL, timeout: REQUEST_TIMEOUT_MS, headers: { 'Content-Type': 'application/json' } });

export class ApiError extends Error {
  constructor(message, { status = 0, code = null, data = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

function toApiError(error, fallback) {
  const data = error?.response?.data;
  if (error?.response) {
    const message = data?.message || data?.error || fallback;
    return new ApiError(message, { status: error.response.status, code: data?.code || null, data });
  }
  if (error?.code === 'ECONNABORTED') {
    return new ApiError('The server is taking too long to respond (it may be waking up). Please try again.', { code: 'TIMEOUT' });
  }
  return new ApiError('Cannot reach the server. Check your internet connection and try again.', { code: 'NETWORK' });
}

async function request(method, url, body, fallback, { auth = false } = {}) {
  try {
    const headers = {};
    if (auth) {
      const token = getAuthToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }
    const response = await http.request({ method, url, data: body, headers });
    return response.data;
  } catch (error) {
    const apiError = toApiError(error, fallback);
    if (process.env.NODE_ENV !== 'production') console.error(`${method.toUpperCase()} ${url} failed:`, apiError, apiError.data);
    throw apiError;
  }
}

/** Fire-and-forget request that wakes a sleeping backend before the user submits. */
export const warmUpBackend = () => {
  http.get('/health', { timeout: REQUEST_TIMEOUT_MS }).catch(() => {});
};

export const sendOTP = (email) => request('post', '/otp/send', { email: email.trim() }, 'Unable to send OTP. Please try again.');
export const resendOTP = sendOTP;
export const verifyOTP = (email, otp) => request('post', '/otp/verify', { email: email.trim(), otp }, 'Unable to verify OTP. Please try again.');

export const registerUser = (email, password, displayName, verificationToken) =>
  request('post', '/auth/register', { email: email.trim(), password, displayName, verificationToken }, 'Unable to create account. Please try again.');

export const loginUser = (email, password) => request('post', '/auth/login', { email: email.trim(), password }, 'Unable to sign in. Please try again.');

export const fetchCurrentUser = () => request('get', '/auth/me', undefined, 'Unable to load your account.', { auth: true });

export const requestPasswordReset = (email) => request('post', '/auth/forgot-password', { email: email.trim() }, 'Unable to send reset code. Please try again.');

export const resetPassword = (email, otp, password) =>
  request('post', '/auth/reset-password', { email: email.trim(), otp, password }, 'Unable to reset password. Please try again.');

const emailService = { sendOTP, verifyOTP, resendOTP, registerUser, loginUser, fetchCurrentUser, requestPasswordReset, resetPassword, warmUpBackend };
export default emailService;
