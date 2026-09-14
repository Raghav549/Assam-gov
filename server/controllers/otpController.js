const crypto = require('crypto');
const { sendOtpEmail } = require('../mailer');

const otpStore = new Map();
const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;
const MAX_ATTEMPTS = 5;

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function isEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function hashOtp(otp) {
  return crypto.createHash('sha256').update(String(otp)).digest('hex');
}

function generateOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

exports.sendOtp = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!isEmail(email)) {
      return res.status(400).json({ ok: false, message: 'Valid email is required' });
    }

    const existing = otpStore.get(email);
    const now = Date.now();
    if (existing && now - existing.sentAt < RESEND_COOLDOWN_MS) {
      const wait = Math.ceil((RESEND_COOLDOWN_MS - (now - existing.sentAt)) / 1000);
      return res.status(429).json({ ok: false, message: `Please wait ${wait}s before requesting another OTP.` });
    }

    const otp = generateOtp();
    await sendOtpEmail(email, otp);

    otpStore.set(email, {
      codeHash: hashOtp(otp),
      expiresAt: now + OTP_TTL_MS,
      sentAt: now,
      attempts: 0
    });

    return res.json({ ok: true, message: 'OTP sent successfully to your email' });
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

    const record = otpStore.get(email);
    if (!record) {
      return res.status(400).json({ ok: false, message: 'OTP not found. Please request a new OTP.' });
    }
    if (Date.now() > record.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ ok: false, message: 'OTP has expired. Please request a new OTP.' });
    }
    if (record.attempts >= MAX_ATTEMPTS) {
      otpStore.delete(email);
      return res.status(429).json({ ok: false, message: 'Too many invalid attempts. Please request a new OTP.' });
    }

    record.attempts += 1;
    if (hashOtp(otp) !== record.codeHash) {
      return res.status(400).json({ ok: false, message: 'Invalid OTP' });
    }

    otpStore.delete(email);
    return res.json({ ok: true, verified: true, message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
};
