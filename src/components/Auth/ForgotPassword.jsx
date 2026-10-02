// ============================================
// FORGOT PASSWORD PAGE — reset with an emailed 6-digit code
// ============================================

import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { warmUpBackend } from '../../services/emailService';
import { FiMail, FiArrowLeft, FiLock, FiKey } from 'react-icons/fi';
import toast from 'react-hot-toast';

const inputClass = (hasError) =>
  `appearance-none rounded-lg relative block w-full pl-10 pr-3 py-3 border ${hasError ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all`;

const Spinner = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const ForgotPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { forgotPassword, resetPassword } = useAuth();

  const [step, setStep] = useState(1); // 1: email, 2: code + new password
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => { warmUpBackend(); }, []);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = window.setInterval(() => setCooldown((v) => (v > 0 ? v - 1 : 0)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const requestCode = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }
    setIsLoading(true);
    setErrors({});
    try {
      const response = await forgotPassword(email);
      toast.success('If this email is registered, a reset code is on its way.');
      setStep(2);
      setCooldown(response?.resendAfterSeconds || 30);
    } catch (error) {
      if (error.data?.retryAfter) { setStep(2); setCooldown(error.data.retryAfter); }
      setErrors(step === 1 ? { email: error.message } : { otp: error.message });
      toast.error(error.message || 'Failed to send reset code');
    } finally {
      setIsLoading(false);
    }
  };

  const submitReset = async () => {
    const next = {};
    if (!/^\d{6}$/.test(otp)) next.otp = 'Enter the 6-digit code from your email';
    if (password.length < 8) next.password = 'Password must be at least 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) next.password = 'Password must contain uppercase, lowercase, and a number';
    if (confirmPassword !== password) next.confirmPassword = 'Passwords do not match';
    if (Object.keys(next).length) { setErrors(next); return; }

    setIsLoading(true);
    setErrors({});
    try {
      await resetPassword(email, otp, password);
      toast.success('Password updated! Please log in with your new password.');
      navigate('/login', { replace: true, state: { email: email.trim() } });
    } catch (error) {
      setErrors({ otp: error.message });
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 1) requestCode();
    else submitReset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <Link to="/login" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4">
            <FiArrowLeft className="mr-1 w-4 h-4" /> Back to Login
          </Link>
          <h2 className="text-3xl font-extrabold text-gray-900">Reset Password</h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === 1
              ? "Enter your account email and we'll send you a 6-digit reset code."
              : <>Enter the code sent to <strong>{email.trim()}</strong> and choose a new password.</>}
          </p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
          {step === 1 ? (
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input id="email" name="email" type="email" autoComplete="email" required className={inputClass(errors.email)}
                  placeholder="Email address" value={email} onChange={(e) => { setEmail(e.target.value); setErrors({}); }} />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
          ) : (
            <>
              <div>
                <label htmlFor="otp" className="sr-only">Reset code</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiKey className="h-5 w-5 text-gray-400" />
                  </div>
                  <input id="otp" name="otp" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength="6" required
                    className={`${inputClass(errors.otp)} text-center tracking-widest text-lg font-bold`}
                    placeholder="6-digit code" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} />
                </div>
                {errors.otp && <p className="mt-1 text-sm text-red-600">{errors.otp}</p>}
              </div>
              <div>
                <label htmlFor="password" className="sr-only">New password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input id="password" name="password" type="password" autoComplete="new-password" required className={inputClass(errors.password)}
                    placeholder="New password (min 8 chars, 1 upper, 1 number)" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>
              <div>
                <label htmlFor="confirmPassword" className="sr-only">Confirm new password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required className={inputClass(errors.confirmPassword)}
                    placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>
              <p className="text-center text-xs text-gray-500">
                Check your inbox and spam folder.{' '}
                <button type="button" onClick={requestCode} disabled={cooldown > 0 || isLoading}
                  className="font-medium text-green-600 hover:underline disabled:text-gray-400 disabled:no-underline">
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
                </button>
              </p>
            </>
          )}

          <button type="submit" disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-green-500/30">
            {isLoading ? <Spinner /> : step === 1 ? 'Send Reset Code' : 'Update Password'}
          </button>

          {step === 2 && (
            <button type="button" onClick={() => { setStep(1); setOtp(''); setErrors({}); }}
              className="w-full py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
              Use a different email
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
