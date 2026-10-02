const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { normalizeEmail, isEmail, passwordProblem } = require('../utils/validation');
const { signAuthToken, isValidVerificationToken, signSupabaseToken } = require('../utils/tokens');
const { toPublicUser, getUserByEmail, getUserByUid, insertUser, updatePasswordHash } = require('../services/userService');
const { issueOtp, verifyOtp, maskEmail } = require('../services/otpService');
const { sendWelcomeEmail, sendPasswordChangedEmail } = require('../mailer');

function sessionPayload(user) {
  const publicUser = toPublicUser(user);
  return {
    user: publicUser,
    token: signAuthToken(publicUser),
    supabaseToken: signSupabaseToken(publicUser)
  };
}

/** Fire-and-forget notification email: never blocks or fails the request. */
function notify(promiseFactory, label) {
  Promise.resolve()
    .then(promiseFactory)
    .catch((error) => console.warn(`[mail] ${label} email not sent: ${error.code || ''} ${error.message}`));
}

exports.register = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');
    const displayName = String(req.body.displayName || '').trim().slice(0, 100);
    const verificationToken = String(req.body.verificationToken || '');

    if (!isEmail(email)) return res.status(400).json({ ok: false, message: 'Valid email is required' });
    const pwProblem = passwordProblem(password);
    if (pwProblem) return res.status(400).json({ ok: false, message: pwProblem });
    if (!displayName) return res.status(400).json({ ok: false, message: 'Full name is required' });

    if (!isValidVerificationToken(verificationToken, email)) {
      return res.status(400).json({ ok: false, code: 'EMAIL_NOT_VERIFIED', message: 'Email verification expired or missing. Please verify your email again.' });
    }

    const existing = await getUserByEmail(email);
    if (existing) return res.status(409).json({ ok: false, code: 'EMAIL_TAKEN', message: 'An account with this email already exists.' });

    const now = new Date().toISOString();
    const created = await insertUser({
      // UUID keeps users.uid compatible with the uuid "userId" columns used by every other table.
      uid: crypto.randomUUID(),
      email,
      displayName,
      role: 'student',
      profilePicture: null,
      bio: '',
      location: '',
      phone: '',
      educationLevel: '',
      interests: [],
      passwordHash: await bcrypt.hash(password, 12),
      createdAt: now,
      updatedAt: now,
      isVerified: true,
      isActive: true
    });

    notify(() => sendWelcomeEmail(email, displayName), 'welcome');
    return res.status(201).json({ ok: true, ...sessionPayload(created), message: 'Account created successfully' });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');
    if (!isEmail(email) || !password) return res.status(400).json({ ok: false, message: 'Email and password are required' });

    const user = await getUserByEmail(email);
    if (!user || !user.passwordHash) {
      return res.status(401).json({ ok: false, message: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ ok: false, message: 'Invalid email or password' });
    if (user.isActive === false) return res.status(403).json({ ok: false, message: 'Your account is inactive. Please contact support.' });

    return res.json({ ok: true, ...sessionPayload(user) });
  } catch (error) {
    next(error);
  }
};

exports.me = async (req, res, next) => {
  try {
    const user = await getUserByUid(req.auth.sub);
    if (!user) return res.status(401).json({ ok: false, message: 'Account no longer exists' });
    if (user.isActive === false) return res.status(403).json({ ok: false, message: 'Your account is inactive. Please contact support.' });
    return res.json({ ok: true, ...sessionPayload(user) });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!isEmail(email)) return res.status(400).json({ ok: false, message: 'Valid email is required' });

    const generic = { ok: true, message: 'If an account exists for this email, a password reset code has been sent.' };
    const user = await getUserByEmail(email);
    if (!user || user.isActive === false) {
      console.log(`[otp] reset requested for unknown/inactive ${maskEmail(email)}`);
      return res.json(generic); // don't reveal which emails are registered
    }

    const result = await issueOtp(email, 'reset');
    return res.json({ ...generic, expiresInSeconds: result.expiresInSeconds, resendAfterSeconds: result.resendAfterSeconds });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = String(req.body.otp || '').replace(/\s+/g, '');
    const password = String(req.body.password || req.body.newPassword || '');

    if (!isEmail(email)) return res.status(400).json({ ok: false, message: 'Valid email is required' });
    if (!/^\d{6}$/.test(otp)) return res.status(400).json({ ok: false, message: 'Valid 6 digit code is required' });
    const pwProblem = passwordProblem(password);
    if (pwProblem) return res.status(400).json({ ok: false, message: pwProblem });

    await verifyOtp(email, 'reset', otp);
    const user = await getUserByEmail(email);
    if (!user) return res.status(400).json({ ok: false, message: 'No active code found. Please request a new one.' });

    await updatePasswordHash(user.uid, await bcrypt.hash(password, 12));
    notify(() => sendPasswordChangedEmail(email), 'password-changed');
    return res.json({ ok: true, message: 'Password updated successfully. You can now log in.' });
  } catch (error) {
    next(error);
  }
};
