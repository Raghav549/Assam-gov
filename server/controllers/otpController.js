const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const Otp = require('../models/Otp');
const { sendOtpEmail } = require('../utils/mailer');

const memoryStore = new Map();

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function isEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

async function saveOtp(req, email, otpHash, expiresAt) {
  if (req.mongoReady) {
    await Otp.deleteMany({ email });
    await Otp.create({ email, otpHash, expiresAt });
    return;
  }
  memoryStore.set(email, { otpHash, expiresAt: expiresAt.getTime(), attempts: 0, verified: false });
}

async function findOtp(req, email) {
  if (req.mongoReady) return Otp.findOne({ email }).sort({ createdAt: -1 });
  return memoryStore.get(email) || null;
}

async function markVerified(req, email, record) {
  if (req.mongoReady) {
    record.verified = true;
    await record.save();
    return;
  }
  memoryStore.set(email, { ...record, verified: true });
}

async function increaseAttempts(req, email, record) {
  if (req.mongoReady) {
    record.attempts += 1;
    await record.save();
    return record.attempts;
  }
  const attempts = (record.attempts || 0) + 1;
  memoryStore.set(email, { ...record, attempts });
  return attempts;
}

exports.sendOtp = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!isEmail(email)) return res.status(400).json({ ok: false, message: 'Valid email is required' });

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await saveOtp(req, email, otpHash, expiresAt);
    await sendOtpEmail(email, otp);

    res.json({ ok: true, message: 'OTP sent successfully to your email' });
  } catch (error) {
    next(error);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = String(req.body.otp || '').trim();

    if (!isEmail(email)) return res.status(400).json({ ok: false, message: 'Valid email is required' });
    if (!/^\d{6}$/.test(otp)) return res.status(400).json({ ok: false, message: 'Valid 6 digit OTP is required' });

    const record = await findOtp(req, email);
    if (!record) return res.status(400).json({ ok: false, message: 'OTP not found. Please request a new OTP.' });

    const expiresAt = record.expiresAt instanceof Date ? record.expiresAt.getTime() : record.expiresAt;
    if (Date.now() > expiresAt) return res.status(400).json({ ok: false, message: 'OTP expired. Please request a new OTP.' });
    if ((record.attempts || 0) >= 5) return res.status(429).json({ ok: false, message: 'Too many wrong attempts. Please request a new OTP.' });

    const matched = await bcrypt.compare(otp, record.otpHash);
    if (!matched) {
      await increaseAttempts(req, email, record);
      return res.status(400).json({ ok: false, message: 'Invalid OTP' });
    }

    await markVerified(req, email, record);
    res.json({ ok: true, verified: true, message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
};
