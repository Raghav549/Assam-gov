import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Send OTP via real Gmail SMTP
 * @param {string} email - Recipient email
 * @returns {Promise} - Response from server
 */
export const sendOTP = async (email) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/otp/send`, { email });
    return response.data;
  } catch (error) {
    console.error('Send OTP error:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Verify OTP
 * @param {string} email - User email
 * @param {string} otp - OTP code
 * @returns {Promise} - Verification result
 */
export const verifyOTP = async (email, otp) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/otp/verify`, { email, otp });
    return response.data;
  } catch (error) {
    console.error('Verify OTP error:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Resend OTP
 * @param {string} email - Recipient email
 * @returns {Promise} - Response from server
 */
export const resendOTP = async (email) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/otp/resend`, { email });
    return response.data;
  } catch (error) {
    console.error('Resend OTP error:', error);
    throw error.response?.data || error.message;
  }
};

export default {
  sendOTP,
  verifyOTP,
  resendOTP
};
