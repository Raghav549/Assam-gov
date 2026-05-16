import React, { useState } from 'react';
import toast from 'react-hot-toast';

const API_BASE = process.env.REACT_APP_API_URL || '';

export default function EmailVerification() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [sent, setSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  async function requestOtp() {
    if (!email.trim()) return toast.error('Enter your email');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/otp/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'OTP send failed');
      setSent(true);
      toast.success(data.message || 'OTP sent');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    if (!otp.trim()) return toast.error('Enter OTP');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/otp/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'OTP verification failed');
      setVerified(true);
      toast.success(data.message || 'Email verified');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#e0f2fe,#f0fdf4,#fdf2f8)', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 440, background: 'rgba(255,255,255,.9)', borderRadius: 24, padding: 28, boxShadow: '0 20px 60px rgba(15,23,42,.15)' }}>
        <h1 style={{ margin: 0, fontSize: 30, color: '#0f172a' }}>Email Verification</h1>
        <p style={{ color: '#475569' }}>Enter your email, receive a real OTP, then verify your account.</p>
        <label style={{ fontWeight: 700, color: '#334155' }}>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} disabled={verified} placeholder="your@email.com" style={{ width: '100%', marginTop: 8, marginBottom: 14, padding: '14px 16px', borderRadius: 14, border: '1px solid #cbd5e1', fontSize: 16, boxSizing: 'border-box' }} />
        {sent && !verified && (
          <>
            <label style={{ fontWeight: 700, color: '#334155' }}>6 digit OTP</label>
            <input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="123456" style={{ width: '100%', marginTop: 8, marginBottom: 14, padding: '14px 16px', borderRadius: 14, border: '1px solid #cbd5e1', fontSize: 22, letterSpacing: 6, textAlign: 'center', boxSizing: 'border-box' }} />
          </>
        )}
        {!sent && <button onClick={requestOtp} disabled={loading} style={{ width: '100%', border: 0, borderRadius: 16, padding: 15, fontSize: 17, fontWeight: 800, color: 'white', background: 'linear-gradient(90deg,#2563eb,#06b6d4,#22c55e)' }}>{loading ? 'Sending...' : 'Send OTP'}</button>}
        {sent && !verified && <button onClick={verifyOtp} disabled={loading} style={{ width: '100%', border: 0, borderRadius: 16, padding: 15, fontSize: 17, fontWeight: 800, color: 'white', background: 'linear-gradient(90deg,#16a34a,#06b6d4,#2563eb)' }}>{loading ? 'Verifying...' : 'Verify OTP'}</button>}
        {verified && <div style={{ padding: 16, borderRadius: 16, background: '#dcfce7', color: '#166534', fontWeight: 800, textAlign: 'center' }}>Email verified successfully</div>}
        {sent && !verified && <button onClick={requestOtp} disabled={loading} style={{ marginTop: 12, width: '100%', border: '1px solid #cbd5e1', borderRadius: 16, padding: 13, fontSize: 15, fontWeight: 700, background: 'white', color: '#0f172a' }}>Resend OTP</button>}
      </div>
    </div>
  );
}
