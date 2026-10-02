const rateLimit = require('express-rate-limit');

const json = (message) => (req, res) => res.status(429).json({ ok: false, code: 'RATE_LIMITED', message });

// Protects the mail provider quota / sender reputation from abuse.
const emailSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.EMAIL_SEND_LIMIT_PER_15MIN || 10),
  standardHeaders: true,
  legacyHeaders: false,
  handler: json('Too many code requests from this network. Please try again in a few minutes.')
});

const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: json('Too many attempts. Please try again in a few minutes.')
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: json('Too many login attempts. Please try again in a few minutes.')
});

module.exports = { emailSendLimiter, verifyLimiter, loginLimiter };
