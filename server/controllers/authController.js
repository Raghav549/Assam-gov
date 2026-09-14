const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { supabaseAdmin } = require('../utils/supabase');

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function isEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function requireJwtSecret() {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured on the backend.');
  return process.env.JWT_SECRET;
}

function signToken(user) {
  return jwt.sign(
    { sub: user.uid, email: user.email, role: user.role || 'student' },
    requireJwtSecret(),
    { expiresIn: '7d' }
  );
}

async function getUserByEmail(email) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle();
  if (error) throw error;
  return data;
}

exports.register = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');
    const displayName = String(req.body.displayName || '').trim();

    if (!isEmail(email)) return res.status(400).json({ ok: false, message: 'Valid email is required' });
    if (password.length < 8) return res.status(400).json({ ok: false, message: 'Password must be at least 8 characters' });
    if (!displayName) return res.status(400).json({ ok: false, message: 'Full name is required' });

    const existing = await getUserByEmail(email);
    if (existing) return res.status(409).json({ ok: false, message: 'An account with this email already exists.' });

    if (!req.body.emailVerified) {
      return res.status(400).json({ ok: false, message: 'Email verification is required before account creation.' });
    }

    const uid = `user_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const passwordHash = await bcrypt.hash(password, 12);
    const now = new Date().toISOString();
    const profile = {
      uid,
      email,
      displayName,
      role: 'student',
      profilePicture: null,
      bio: '',
      location: '',
      phone: '',
      educationLevel: '',
      interests: [],
      passwordHash,
      createdAt: now,
      updatedAt: now,
      isVerified: true,
      isActive: true
    };

    const { error } = await supabaseAdmin.from('users').insert(profile);
    if (error) throw error;

    const user = { ...profile };
    delete user.passwordHash;

    return res.status(201).json({
      ok: true,
      user,
      token: signToken(user),
      message: 'Account created successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');
    const user = await getUserByEmail(email);

    if (!user || !user.passwordHash) {
      return res.status(401).json({ ok: false, message: 'Invalid email or password' });
    }
    if (user.isActive === false) {
      return res.status(403).json({ ok: false, message: 'Your account is inactive.' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ ok: false, message: 'Invalid email or password' });

    const safeUser = { ...user };
    delete safeUser.passwordHash;
    return res.json({ ok: true, user: safeUser, token: signToken(safeUser) });
  } catch (error) {
    next(error);
  }
};
