const crypto = require('crypto');
const store = require('../utils/otpStore');
const { sendOtpEmail, MailError } = require('../mailer');
const { HttpError } = require('../utils/httpError');
const { OTP_TTL_MINUTES } = require('../emailTemplates');

const OTP_TTL_MS = OTP_TTL_MINUTES * 60 * 1000;
const RESEND_COOLDOWN_MS = Number(process.env.OTP_RESEND_COOLDOWN_SECONDS || 30) * 1000;
const MAX_ATTEMPTS = 5;
const PURPOSES = ['signup', 'reset'];

let ephemeralSecret = null;
function hashSecret() {
  const configured = String(process.env.OTP_SECRET || process.env.JWT_SECRET || '').trim();
  if (configured) return configured;
  if (!ephemeralSecret) ephemeralSecret = crypto.randomBytes(32).toString('hex');
  return ephemeralSecret;
}

function hashOtp(email, purpose, otp) {
  return crypto.createHmac('sha256', hashSecret()).update(`${purpose}:${email}:${otp}`).digest('hex');
}

function safeEqual(a, b) {
  const x = Buffer.from(String(a), 'hex');
  const y = Buffer.from(String(b), 'hex');
  return x.length === y.length && x.length > 0 && crypto.timingSafeEqual(x, y);
}

function generateOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

function assertPurpose(purpose) {
  if (!PURPOSES.includes(purpose)) throw new Error(`Unknown OTP purpose: ${purpose}`);
}

/** Convert a mail failure into a clear HTTP error for the client. */
function mailHttpError(error) {
  const notConfigured = error.code === 'EMAIL_NOT_CONFIGURED';
  const status = notConfigured ? 503 : error.status === 400 ? 400 : 502;
  const message = error.code === 'EENVELOPE'
    ? 'This email address was rejected by the mail server. Please check it and try again.'
    : notConfigured
      ? 'Email service is not configured on the server. Please contact the administrator.'
      : 'We could not send the email right now. Please try again in a minute.';
  const exposeDetails = process.env.NODE_ENV !== 'production' || String(process.env.EMAIL_DEBUG || '').toLowerCase() === 'true';
  return new HttpError(status, message, {
    code: error.code || 'EMAIL_FAILED',
    ...(exposeDetails ? { detail: error.message, hint: error.hint || null, failures: error.failures } : {})
  });
}

async function issueOtp(email, purpose) {
  assertPurpose(purpose);
  const existing = await store.get(email, purpose);
  const now = Date.now();
  if (existing && now - existing.createdAt < RESEND_COOLDOWN_MS) {
    const wait = Math.ceil((RESEND_COOLDOWN_MS - (now - existing.createdAt)) / 1000);
    throw new HttpError(429, `Please wait ${wait}s before requesting another code.`, { code: 'OTP_COOLDOWN', retryAfter: wait });
  }

  const otp = generateOtp();
  // Store first, then send: the code a user receives is always one we can verify.
  await store.save(email, purpose, { otpHash: hashOtp(email, purpose, otp), expiresAt: now + OTP_TTL_MS });

  try {
    const result = await sendOtpEmail(email, otp, { purpose });
    console.log(`[otp] ${purpose} code sent to ${maskEmail(email)} via ${result.provider}`);
    return { provider: result.provider, expiresInSeconds: OTP_TTL_MS / 1000, resendAfterSeconds: RESEND_COOLDOWN_MS / 1000 };
  } catch (error) {
    // Let the user retry immediately instead of waiting out the cooldown.
    await store.remove(email, purpose).catch(() => {});
    if (error instanceof MailError) throw mailHttpError(error);
    throw error;
  }
}

async function verifyOtp(email, purpose, otp) {
  assertPurpose(purpose);
  const record = await store.get(email, purpose);
  if (!record) throw new HttpError(400, 'No active code found. Please request a new one.', { code: 'OTP_NOT_FOUND' });
  if (Date.now() > record.expiresAt) {
    await store.remove(email, purpose);
    throw new HttpError(400, 'This code has expired. Please request a new one.', { code: 'OTP_EXPIRED' });
  }
  if ((record.attempts || 0) >= MAX_ATTEMPTS) {
    await store.remove(email, purpose);
    throw new HttpError(429, 'Too many incorrect attempts. Please request a new code.', { code: 'OTP_LOCKED' });
  }

  if (!safeEqual(hashOtp(email, purpose, otp), record.otpHash)) {
    const attempts = await store.incrementAttempts(record);
    const left = Math.max(0, MAX_ATTEMPTS - attempts);
    if (left === 0) await store.remove(email, purpose);
    throw new HttpError(400, left ? `Incorrect code. ${left} attempt${left === 1 ? '' : 's'} left.` : 'Too many incorrect attempts. Please request a new code.', { code: 'OTP_INVALID', attemptsLeft: left });
  }

  await store.remove(email, purpose);
  return true;
}

function maskEmail(email) {
  const [name, domain] = String(email).split('@');
  return `${name.slice(0, 2)}***@${domain}`;
}

module.exports = { issueOtp, verifyOtp, mailHttpError, maskEmail, RESEND_COOLDOWN_MS, OTP_TTL_MS, MAX_ATTEMPTS };
