import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  sendOTP,
  verifyOTP,
  resendOTP,
  registerUser,
  loginUser,
  fetchCurrentUser,
  requestPasswordReset,
  resetPassword as resetPasswordRequest
} from '../services/emailService';
import { loadSession, saveSession, clearSession } from '../services/session';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

const normalize = (email) => String(email || '').trim().toLowerCase();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [pendingEmail, setPendingEmail] = useState(null);
  // If OTP verification succeeds but account creation fails (network/DB), the
  // code is already consumed — reuse the (15 min) verification token on retry.
  const verifiedRef = useRef(null);

  const applySession = useCallback((session) => {
    saveSession({ token: session.token, user: session.user, supabaseToken: session.supabaseToken || null });
    setUser(session.user);
    setUserData(session.user);
  }, []);

  const resetState = useCallback(() => {
    clearSession();
    setUser(null);
    setUserData(null);
    setOtpSent(false);
    setPendingEmail(null);
  }, []);

  // Restore session (expired tokens are discarded by loadSession), then refresh
  // the profile in the background so role / active status changes apply.
  useEffect(() => {
    const session = loadSession();
    if (!session) {
      clearSession();
      setLoading(false);
      return;
    }
    setUser(session.user);
    setUserData(session.user);
    setLoading(false);

    fetchCurrentUser()
      .then((fresh) => { if (fresh?.ok && fresh.token) applySession(fresh); })
      .catch((error) => { if (error.status === 401 || error.status === 403) resetState(); });
  }, [applySession, resetState]);

  // ---------- signup (email OTP) ----------
  const signup = async (email) => {
    try {
      const response = await sendOTP(email);
      if (!response?.ok) throw new Error(response?.message || 'OTP could not be sent.');
      setPendingEmail(normalize(email));
      setOtpSent(true);
      toast.success('Verification code sent! Check your inbox (and spam folder).');
      return { success: true, step: 'verify', resendAfterSeconds: response.resendAfterSeconds || 30 };
    } catch (error) {
      toast.error(error.message || 'Failed to send OTP');
      throw error;
    }
  };

  const resendSignupOTP = async (email) => {
    const response = await resendOTP(email);
    if (!response?.ok) throw new Error(response?.message || 'OTP could not be resent.');
    setPendingEmail(normalize(email));
    setOtpSent(true);
    toast.success('New code sent to your email!');
    return response;
  };

  const verifyAndCreateAccount = async (email, otp, password, displayName) => {
    try {
      let verificationToken = null;
      const cached = verifiedRef.current;
      if (cached && cached.email === normalize(email) && cached.otp === otp && Date.now() < cached.expiresAt) {
        verificationToken = cached.token;
      } else {
        const verification = await verifyOTP(email, otp);
        if (!verification?.ok || !verification?.verificationToken) throw new Error(verification?.message || 'Invalid OTP');
        verificationToken = verification.verificationToken;
        verifiedRef.current = { email: normalize(email), otp, token: verificationToken, expiresAt: Date.now() + 14 * 60 * 1000 };
      }

      const response = await registerUser(email, password, displayName, verificationToken);
      if (!response?.ok || !response?.token || !response?.user) throw new Error(response?.message || 'Account creation failed.');

      verifiedRef.current = null;
      applySession(response);
      setOtpSent(false);
      setPendingEmail(null);
      toast.success('Account created successfully!');
      return { success: true, user: response.user, token: response.token };
    } catch (error) {
      if (error.code === 'EMAIL_NOT_VERIFIED') verifiedRef.current = null;
      toast.error(error.message || 'Verification failed');
      throw error;
    }
  };

  // ---------- login / logout ----------
  const login = async (email, password) => {
    try {
      const response = await loginUser(email, password);
      if (!response?.ok || !response?.token || !response?.user) throw new Error(response?.message || 'Login failed.');
      applySession(response);
      toast.success('Logged in successfully!');
      return response;
    } catch (error) {
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const logout = async () => {
    resetState();
    toast.success('Logged out successfully');
  };

  // ---------- password reset (email code) ----------
  const forgotPassword = async (email) => {
    const response = await requestPasswordReset(email);
    if (!response?.ok) throw new Error(response?.message || 'Could not send reset code.');
    return response;
  };

  const resetPassword = async (email, otp, password) => {
    const response = await resetPasswordRequest(email, otp, password);
    if (!response?.ok) throw new Error(response?.message || 'Could not reset password.');
    return response;
  };

  // ---------- profile ----------
  const updateLocalUser = useCallback((changes) => {
    setUserData((prev) => {
      const next = { ...(prev || {}), ...changes };
      const session = loadSession();
      if (session) saveSession({ ...session, user: next });
      setUser(next);
      return next;
    });
  }, []);

  const refreshUser = useCallback(async () => {
    const fresh = await fetchCurrentUser();
    if (fresh?.ok && fresh.token) applySession(fresh);
    return fresh?.user || null;
  }, [applySession]);

  const value = {
    user, userData, loading, otpSent, pendingEmail,
    signup, resendSignupOTP, verifyAndCreateAccount, login, logout,
    forgotPassword, resetPassword, refreshUser, updateLocalUser,
    isAdmin: userData?.role === 'admin',
    isStudent: userData?.role === 'student'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
