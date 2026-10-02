const { issueOtp, verifyOtp } = require('../services/otpService');
const { getUserByEmail } = require('../services/userService');
const { isSupabaseConfigured } = require('../utils/supabase');
const { normalizeEmail, isEmail } = require('../utils/validation');
const { signVerificationToken } = require('../utils/tokens');

exports.sendOtp = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body && req.body.email);
    if (!isEmail(email)) return res.status(400).json({ ok: false, message: 'Valid email is required' });

    // Don't make people verify an email that can never be registered.
    if (isSupabaseConfigured()) {
      const existing = await getUserByEmail(email);
      if (existing) {
        return res.status(409).json({ ok: false, code: 'EMAIL_TAKEN', message: 'An account with this email already exists. Please log in instead.' });
      }
    }

    const result = await issueOtp(email, 'signup');
    return res.json({ ok: true, message: 'OTP sent successfully to your email', ...result });
  } catch (error) {
    next(error);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body && req.body.email);
    const otp = String((req.body && req.body.otp) || '').replace(/\s+/g, '');

    if (!isEmail(email)) return res.status(400).json({ ok: false, message: 'Valid email is required' });
    if (!/^\d{6}$/.test(otp)) return res.status(400).json({ ok: false, message: 'Valid 6 digit OTP is required' });

    await verifyOtp(email, 'signup', otp);
    return res.json({
      ok: true,
      verified: true,
      verificationToken: signVerificationToken(email),
      message: 'Email verified successfully'
    });
  } catch (error) {
    next(error);
  }
};
