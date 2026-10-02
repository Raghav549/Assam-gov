const { verifyAuthToken } = require('../utils/tokens');
const { HttpError } = require('../utils/httpError');

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;
  if (!token) return res.status(401).json({ ok: false, message: 'Authentication required' });
  try {
    req.auth = verifyAuthToken(token);
    return next();
  } catch (error) {
    if (error instanceof HttpError) return next(error); // server misconfiguration, not a bad token
    return res.status(401).json({ ok: false, message: 'Invalid or expired authentication token' });
  }
}

module.exports = { authenticate };
