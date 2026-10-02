require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const otpRoutes = require('./routes/otpRoutes');
const authRoutes = require('./routes/authRoutes');
const { verifyMailer, describeConfig } = require('./mailer');
const { isSupabaseConfigured } = require('./utils/supabase');
const otpStore = require('./utils/otpStore');

const app = express();
const PORT = Number(process.env.PORT || 5000);
const HOST = process.env.HOST || '0.0.0.0';
const isProduction = process.env.NODE_ENV === 'production';
const buildPath = path.join(__dirname, '..', 'build');

// ---------- CORS ----------
// CLIENT_URL may be a comma separated list. Trailing slashes are ignored
// ("https://site.com/" previously never matched the browser's Origin header,
// which made every OTP request fail with a CORS "Network Error").
// Wildcards are supported: https://*.vercel.app
function buildOriginMatcher(value) {
  const entries = String(value || '')
    .split(',')
    .map((s) => s.trim().replace(/\/+$/, ''))
    .filter(Boolean);
  if (!entries.length || entries.includes('*')) return () => true;
  const matchers = entries.map((entry) => {
    if (!entry.includes('*')) return (origin) => origin.toLowerCase() === entry.toLowerCase();
    const regex = new RegExp(`^${entry.split('*').map((p) => p.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('[^.]+')}$`, 'i');
    return (origin) => regex.test(origin);
  });
  return (origin) => matchers.some((m) => m(origin));
}
const isAllowedOrigin = buildOriginMatcher(process.env.CLIENT_URL);

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: false, contentSecurityPolicy: false }));
app.use(cors({
  origin(origin, callback) {
    // Same-origin / server-to-server / curl requests have no Origin header.
    if (!origin || isAllowedOrigin(origin.replace(/\/+$/, ''))) return callback(null, true);
    console.warn(`[cors] blocked origin ${origin} — add it to CLIENT_URL`);
    return callback(null, false);
  },
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }));

// ---------- health ----------
app.get('/api/health', async (req, res) => {
  const fresh = req.query.fresh === '1' || req.query.fresh === 'true';
  const mail = describeConfig();
  let smtp = 'unknown';
  let smtpError = null;
  let provider = null;
  try {
    const result = await verifyMailer({ fresh });
    smtp = 'ready'; // name kept for the OTP E2E workflow; means "email transport ready"
    provider = result.provider;
  } catch (error) {
    smtp = error.code === 'EMAIL_NOT_CONFIGURED' ? 'not_configured' : 'error';
    smtpError = {
      code: error.code || null,
      provider: error.provider || null,
      message: String(error.message || 'Email verification failed'),
      hint: error.hint || null,
      failures: error.failures || undefined
    };
  }
  res.json({
    ok: true,
    auth: 'custom-jwt',
    database: isSupabaseConfigured() ? 'supabase' : 'not_configured',
    otpStore: otpStore.mode(),
    jwt: process.env.JWT_SECRET ? 'configured' : 'missing',
    smtp,
    mail: { provider, chain: mail.chain, sender: mail.sender },
    smtpError,
    time: new Date().toISOString()
  });
});

app.get('/', (req, res, next) => {
  if (fs.existsSync(path.join(buildPath, 'index.html'))) return next();
  res.json({ ok: true, name: 'Youth Assam Backend', status: 'running' });
});

app.use('/api/otp', otpRoutes);
app.use('/api/auth', authRoutes);

app.use('/api', (req, res) => {
  res.status(404).json({ ok: false, message: 'Route not found' });
});

// ---------- frontend (optional, when the CRA build is deployed with the API) ----------
app.use(express.static(buildPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'), (error) => {
    if (error && !res.headersSent) res.status(404).json({ ok: false, message: 'Frontend build not found. Backend API is running.' });
  });
});

// ---------- errors ----------
// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  if (error && error.type === 'entity.parse.failed') {
    return res.status(400).json({ ok: false, message: 'Invalid JSON body' });
  }
  const status = Number(error && error.status) || 500;
  if (status >= 500) console.error(`[error] ${req.method} ${req.path}:`, error);
  const body = {
    ok: false,
    code: error.code || undefined,
    message: status >= 500 && isProduction && !error.expose && error.name !== 'HttpError'
      ? 'Something went wrong on the server. Please try again.'
      : error.message || 'Internal server error'
  };
  for (const field of ['retryAfter', 'attemptsLeft', 'detail', 'hint', 'failures']) {
    if (error[field] !== undefined) body[field] = error[field];
  }
  if (error.retryAfter) res.set('Retry-After', String(error.retryAfter));
  res.status(status).json(body);
});

// ---------- start ----------
function logStartupDiagnostics() {
  const mail = describeConfig();
  console.log(`[config] database: ${isSupabaseConfigured() ? 'supabase' : 'NOT CONFIGURED (register/login unavailable)'}`);
  console.log(`[config] OTP store: ${otpStore.mode()}`);
  if (!process.env.JWT_SECRET) console.warn('[config] JWT_SECRET is missing — verification and login tokens cannot be issued.');
  if (mail.error) console.warn(`[config] email: ${mail.error}`);
  else console.log(`[config] email providers: ${mail.chain.join(' → ')} (sender: ${mail.sender || 'MISSING'})`);
  if (mail.chain[0] === 'smtp' && process.env.RENDER) {
    console.warn('[config] Running on Render with SMTP only. Render FREE instances block SMTP ports 25/465/587 — set BREVO_API_KEY (or another HTTPS provider) if emails time out.');
  }
  verifyMailer().then(
    (r) => console.log(`[mail] ready via ${r.provider}`),
    (e) => console.error(`[mail] NOT ready: ${e.code || ''} ${e.message}${e.hint ? ` — ${e.hint}` : ''}`)
  );
}

if (require.main === module) {
  app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
    logStartupDiagnostics();
  });
}

module.exports = app;
