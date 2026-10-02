const jwt = require('jsonwebtoken');
const { HttpError } = require('./httpError');

const VERIFICATION_TTL_SECONDS = 15 * 60;

function requireJwtSecret() {
  const secret = String(process.env.JWT_SECRET || '').trim();
  if (!secret) throw new HttpError(503, 'JWT_SECRET is not configured on the backend.', { code: 'JWT_NOT_CONFIGURED' });
  return secret;
}

function signAuthToken(user) {
  return jwt.sign(
    { sub: user.uid, email: user.email, role: user.role || 'student', typ: 'access' },
    requireJwtSecret(),
    { expiresIn: '7d' }
  );
}

function verifyAuthToken(token) {
  const payload = jwt.verify(token, requireJwtSecret());
  if (payload.purpose) throw new Error('Not an access token');
  return payload;
}

function signVerificationToken(email) {
  return jwt.sign({ purpose: 'email_verification', email }, requireJwtSecret(), { expiresIn: VERIFICATION_TTL_SECONDS });
}

function isValidVerificationToken(token, email) {
  if (!token) return false;
  try {
    const payload = jwt.verify(token, requireJwtSecret());
    return payload.purpose === 'email_verification' && payload.email === email;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    return false;
  }
}

/**
 * Optional bridge so the browser's Supabase client passes RLS (auth.uid())
 * for users of this custom JWT auth. Requires SUPABASE_JWT_SECRET (Supabase
 * Dashboard → Project Settings → JWT Keys → Legacy JWT secret). Returns null
 * when not configured.
 */
function signSupabaseToken(user) {
  const secret = String(process.env.SUPABASE_JWT_SECRET || '').trim();
  if (!secret || !user || !user.uid) return null;
  return jwt.sign(
    { sub: user.uid, email: user.email, role: 'authenticated', aud: 'authenticated', app_role: user.role || 'student' },
    secret,
    { expiresIn: '7d' }
  );
}

module.exports = {
  requireJwtSecret,
  signAuthToken,
  verifyAuthToken,
  signVerificationToken,
  isValidVerificationToken,
  signSupabaseToken,
  VERIFICATION_TTL_SECONDS
};
