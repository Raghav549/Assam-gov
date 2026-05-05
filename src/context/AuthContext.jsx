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
import { sendOTP, verifyOTP } from '../services/emailService';
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
  const [user, setUser] = useState(null); // Firebase User Object
  const [userData, setUserData] = useState(null); // Firestore User Data
  const [loading, setLoading] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [pendingEmail, setPendingEmail] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const data = await getUserById(firebaseUser.uid);
          setUserData(data);
        } catch (error) {
          console.error("Error fetching user ", error);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle Registration with OTP
  const signup = async (email, password, displayName) => {
    setLoading(true);
    try {
      // 1. Send OTP first
      await sendOTP(email);
      setPendingEmail(email);
      setOtpSent(true);
      toast.success('OTP sent to your email!');
      return { success: true, step: 'verify' };
    } catch (error) {
      toast.error(error.message || 'Failed to send OTP');
      setLoading(false);
      throw error;
    }
  };

  // Verify OTP and Create Account
  const verifyAndCreateAccount = async (email, otp, password, displayName) => {
    setLoading(true);
    try {
      // 1. Verify OTP via Backend
      const response = await verifyOTP(email, otp);
      
      if (response.success) {
        // 2. Create Firebase User
        const firebaseUser = await registerUser(email, password, displayName);
        
        // Context updates automatically via listener
        toast.success('Account created successfully!');
        setOtpSent(false);
        setPendingEmail(null);
        setLoading(false);
        return { success: true };
      } else {
        throw new Error(response.message || 'Invalid OTP');
      }
    } catch (error) {
      toast.error(error.message || 'Verification failed');
      setLoading(false);
      throw error;
    }
  };

  // Login
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

  // Logout
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

  // Forgot Password
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
