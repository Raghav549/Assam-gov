// ============================================
// AUTH CONTEXT - GLOBAL STATE MANAGEMENT
// ============================================

import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  onAuthStateChange,
  getUserById,
  registerUser,
  loginUser,
  logoutUser,
  resetPassword
} from '../services/firebase';
import { sendOTP, verifyOTP, resendOTP } from '../services/emailService';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [pendingEmail, setPendingEmail] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const data = await getUserById(firebaseUser.uid);
          setUserData(data);
        } catch (error) {
          console.error('Error fetching user', error);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Send OTP. Only move to the OTP screen after the backend confirms success.
  const signup = async (email, password, displayName) => {
    setLoading(true);
    try {
      const response = await sendOTP(email);

      if (!response?.ok && !response?.success) {
        throw new Error(response?.message || 'OTP could not be sent.');
      }

      setPendingEmail(email);
      setOtpSent(true);
      setLoading(false);
      toast.success('OTP sent to your email!');
      return { success: true, step: 'verify' };
    } catch (error) {
      setLoading(false);
      toast.error(error.message || 'Failed to send OTP');
      throw error;
    }
  };

  // Verify OTP first, then create the Firebase account.
  const verifyAndCreateAccount = async (email, otp, password, displayName) => {
    setLoading(true);
    try {
      const response = await verifyOTP(email, otp);

      // Backend returns { ok: true }, while older code expected { success: true }.
      if (!response?.ok && !response?.success) {
        throw new Error(response?.message || 'Invalid OTP');
      }

      await registerUser(email, password, displayName);

      setOtpSent(false);
      setPendingEmail(null);
      setLoading(false);
      toast.success('Account created successfully!');
      return { success: true };
    } catch (error) {
      setLoading(false);
      toast.error(error.message || 'Verification failed');
      throw error;
    }
  };

  const resendSignupOTP = async (email) => {
    try {
      const response = await resendOTP(email);
      if (!response?.ok && !response?.success) {
        throw new Error(response?.message || 'OTP could not be resent.');
      }
      toast.success('New OTP sent to your email!');
      return response;
    } catch (error) {
      toast.error(error.message || 'Failed to resend OTP');
      throw error;
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      await loginUser(email, password);
      toast.success('Logged in successfully!');
      setLoading(false);
    } catch (error) {
      toast.error(error.message || 'Login failed');
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      toast.success('Logged out successfully');
      setLoading(false);
    } catch (error) {
      toast.error('Logout failed');
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    try {
      await resetPassword(email);
      toast.success('Password reset link sent to your email');
    } catch (error) {
      toast.error(error.message || 'Failed to send reset link');
    }
  };

  const value = {
    user,
    userData,
    loading,
    otpSent,
    pendingEmail,
    signup,
    resendSignupOTP,
    verifyAndCreateAccount,
    login,
    logout,
    forgotPassword,
    isAdmin: userData?.role === 'admin',
    isStudent: userData?.role === 'student'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
