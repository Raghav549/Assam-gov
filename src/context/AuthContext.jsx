import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { sendOTP, verifyOTP, resendOTP, registerUser, loginUser } from '../services/emailService';

const AuthContext = createContext(null);
const SESSION_KEY = 'youth_assam_session';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

const saveSession = (session) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

const loadSession = () => {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }
  catch { return null; }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [pendingEmail, setPendingEmail] = useState(null);

  useEffect(() => {
    const session = loadSession();
    if (session?.token && session?.user) {
      setUser(session.user);
      setUserData(session.user);
    }
    setLoading(false);
  }, []);

  const signup = async (email) => {
    setLoading(true);
    try {
      const response = await sendOTP(email);
      if (!response?.ok && !response?.success) throw new Error(response?.message || 'OTP could not be sent.');
      setPendingEmail(email.trim().toLowerCase());
      setOtpSent(true);
      toast.success('OTP sent to your email!');
      return { success: true, step: 'verify' };
    } catch (error) {
      toast.error(error.message || 'Failed to send OTP');
      throw error;
    } finally { setLoading(false); }
  };

  const verifyAndCreateAccount = async (email, otp, password, displayName) => {
    setLoading(true);
    try {
      const verification = await verifyOTP(email, otp);
      if (!verification?.ok && !verification?.success) throw new Error(verification?.message || 'Invalid OTP');

      const response = await registerUser(email, password, displayName);
      if (!response?.ok || !response?.token || !response?.user) throw new Error(response?.message || 'Account creation failed.');

      saveSession({ token: response.token, user: response.user });
      setUser(response.user);
      setUserData(response.user);
      setOtpSent(false);
      setPendingEmail(null);
      toast.success('Account created successfully!');
      return { success: true, user: response.user, token: response.token };
    } catch (error) {
      toast.error(error.message || 'Verification failed');
      throw error;
    } finally { setLoading(false); }
  };

  const resendSignupOTP = async (email) => {
    const response = await resendOTP(email);
    if (!response?.ok && !response?.success) throw new Error(response?.message || 'OTP could not be resent.');
    setPendingEmail(email.trim().toLowerCase());
    setOtpSent(true);
    toast.success('New OTP sent to your email!');
    return response;
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await loginUser(email, password);
      if (!response?.ok || !response?.token || !response?.user) throw new Error(response?.message || 'Login failed.');
      saveSession({ token: response.token, user: response.user });
      setUser(response.user);
      setUserData(response.user);
      toast.success('Logged in successfully!');
      return response;
    } catch (error) {
      toast.error(error.message || 'Login failed');
      throw error;
    } finally { setLoading(false); }
  };

  const logout = async () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    setUserData(null);
    setOtpSent(false);
    setPendingEmail(null);
    toast.success('Logged out successfully');
  };

  const forgotPassword = async () => {
    throw new Error('Password reset is not enabled in the custom JWT authentication flow yet.');
  };

  const value = {
    user, userData, loading, otpSent, pendingEmail,
    signup, resendSignupOTP, verifyAndCreateAccount, login, logout, forgotPassword,
    isAdmin: userData?.role === 'admin',
    isStudent: userData?.role === 'student'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
