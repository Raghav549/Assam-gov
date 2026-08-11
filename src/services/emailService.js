import axios from 'axios';

// Always use the real Render backend in production. Localhost is only for local development.
const PRODUCTION_BACKEND_URL = 'https://youth-assam-backend.onrender.com';
const configuredBaseUrl =
  process.env.REACT_APP_BACKEND_URL ||
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production' ? PRODUCTION_BACKEND_URL : 'http://localhost:5000');

const API_BASE_URL = configuredBaseUrl.replace(/\/$/, '') + '/api';

const getErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

export const sendOTP = async (email) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/otp/send`, { email }, { timeout: 25000 });
    return response.data;
  } catch (error) {
    console.error('Send OTP error:', error);
    throw new Error(getErrorMessage(error, 'Unable to send OTP. Please try again.'));
  }
};

export const verifyOTP = async (email, otp) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/otp/verify`, { email, otp }, { timeout: 25000 });
    return response.data;
  } catch (error) {
    console.error('Verify OTP error:', error);
    throw new Error(getErrorMessage(error, 'Unable to verify OTP. Please try again.'));
  }
};

export const resendOTP = async (email) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/otp/send`, { email }, { timeout: 25000 });
    return response.data;
  } catch (error) {
    console.error('Resend OTP error:', error);
    throw new Error(getErrorMessage(error, 'Unable to resend OTP. Please try again.'));
  }
};

export default { sendOTP, verifyOTP, resendOTP };
