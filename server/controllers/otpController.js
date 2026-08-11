const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { supabaseAdmin } = require('../utils/supabase');
const { sendOtpEmail } = require('../utils/mailer');

function normalizeEmail(email) { return String(email || '').trim().toLowerCase(); }
function isEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function generateOtp() { return crypto.randomInt(100000, 999999).toString(); }

async function saveOtp(email, otpHash, expiresAt) {
  const { error: deleteError } = await supabaseAdmin.from('otp_codes').delete().eq('email', email);
  if (deleteError) throw deleteError;
  const { error } = await supabaseAdmin.from('otp_codes').insert({ email, otpHash, attempts: 0, verified: false, expiresAt: expiresAt.toISOString() });
  if (error) throw error;
}

async function findOtp(email) {
  const { data, error } = await supabaseAdmin.from('otp_codes').select('*').eq('email', email).order('createdAt', { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return data;
}

async function updateOtp(id, patch) {
  const { data, error } = await supabaseAdmin.from('otp_codes').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

exports.sendOtp = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!isEmail(email)) return res.status(400).json({ ok: false, message: 'Valid email is required' });
    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await saveOtp(email, otpHash, expiresAt);
    await sendOtpEmail(email, otp);
    res.json({ ok: true, message: 'OTP sent successfully to your email' });
  } catch (error) { next(error); }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = String(req.body.otp || '').trim();
    if (!isEmail(email)) return res.status(400).json({ ok: false, message: 'Valid email is required' });
    if (!/^\d{6}$/.test(otp)) return res.status(400).json({ ok: false, message: 'Valid 6 digit OTP is required' });

    const record = await findOtp(email);
    if (!record) return res.status(400).json({ ok: false, message: 'OTP not found. Please request a new OTP.' });
    if (Date.now() > new Date(record.expiresAt).getTime()) {
      await supabaseAdmin.from('otp_codes').delete().eq('id', record.id);
      return res.status(400).json({ ok: false, message: 'OTP expired. Please request a new OTP.' });
    }
    if ((record.attempts || 0) >= 5) return res.status(429).json({ ok: false, message: 'Too many wrong attempts. Please request a new OTP.' });

    const matched = await bcrypt.compare(otp, record.otpHash);
    if (!matched) {
      await updateOtp(record.id, { attempts: (record.attempts || 0) + 1 });
      return res.status(400).json({ ok: false, message: 'Invalid OTP' });
    }

    await updateOtp(record.id, { verified: true });
    res.json({ ok: true, verified: true, message: 'Email verified successfully' });
  } catch (error) { next(error); }
};
