import axios from 'axios';

// Production backend is hosted on Render. Keep localhost only for local development.
const configuredBaseUrl =
  process.env.REACT_APP_BACKEND_URL ||
  process.env.REACT_APP_API_URL ||
  'http://localhost:5000';

const API_BASE_URL = configuredBaseUrl.replace(/\/$/, '') + '/api';

const getErrorMessage = (error, fallback) => {
  return error?.response?.data?.message || error?.response?.data?.error || error?.message || fallback;
};

/** Send OTP through the real backend/Gmail SMTP service. */
export const sendOTP = async (email) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/otp/send`, { email }, { timeout: 20000 });
    return response.data;
  } catch (error) {
    console.error('Send OTP error:', error);
    throw new Error(getErrorMessage(error, 'Unable to send OTP. Please try again.'));
  }
};

/** Verify OTP through the real backend. */
export const verifyOTP = async (email, otp) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/otp/verify`, { email, otp }, { timeout: 20000 });
    return response.data;
  } catch (error) {
    console.error('Verify OTP error:', error);
    throw new Error(getErrorMessage(error, 'Unable to verify OTP. Please try again.'));
  }
};

/** Resend OTP through the real backend. */
export const resendOTP = async (email) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/otp/resend`, { email }, { timeout: 20000 });
    return response.data;
  } catch (error) {
    console.error('Resend OTP error:', error);
    throw new Error(getErrorMessage(error, 'Unable to resend OTP. Please try again.'));
  }
};

export default { sendOTP, verifyOTP, resendOTP };
