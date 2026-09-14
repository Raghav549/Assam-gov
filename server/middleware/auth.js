const jwt = require('jsonwebtoken');

function requireJwtSecret() {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured on the backend.');
  return process.env.JWT_SECRET;
}

function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ ok: false, message: 'Authentication required' });

    req.auth = jwt.verify(token, requireJwtSecret());
    return next();
  } catch (error) {
    return res.status(401).json({ ok: false, message: 'Invalid or expired authentication token' });
  }
}

module.exports = { authenticate };
