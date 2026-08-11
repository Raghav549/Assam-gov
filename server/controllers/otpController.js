const { supabaseAdmin } = require('../utils/supabase');

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function isEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

exports.sendOtp = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!isEmail(email)) {
      return res.status(400).json({ ok: false, message: 'Valid email is required' });
    }

    const { error } = await supabaseAdmin.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true }
    });

    if (error) throw error;
    res.json({ ok: true, message: 'OTP sent successfully to your email' });
  } catch (error) {
    next(error);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = String(req.body.otp || '').trim();
    if (!isEmail(email)) {
      return res.status(400).json({ ok: false, message: 'Valid email is required' });
    }
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ ok: false, message: 'Valid 6 digit OTP is required' });
    }

    const { data, error } = await supabaseAdmin.auth.verifyOtp({
      email,
      token: otp,
      type: 'email'
    });

    if (error) throw error;

    res.json({
      ok: true,
      verified: true,
      message: 'Email verified successfully',
      user: data?.user || null,
      session: data?.session || null
    });
  } catch (error) {
    next(error);
  }
};
