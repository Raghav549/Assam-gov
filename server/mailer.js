// ============================================
// MAILER — multi-provider, production-safe
// ============================================
//
// Why this exists:
//   Render's FREE web services block outbound SMTP ports 25/465/587
//   (https://render.com/changelog/free-web-services-will-no-longer-allow-outbound-traffic-to-smtp-ports).
//   Gmail SMTP therefore times out on Render no matter how correct the
//   credentials are. HTTPS email APIs are not affected, so this module can
//   send through any of:
//
//     brevo    BREVO_API_KEY                      (free 300/day, any recipient,
//                                                  only needs a verified sender email)
//     resend   RESEND_API_KEY                     (needs a verified domain to email
//                                                  anyone other than yourself)
//     sendgrid SENDGRID_API_KEY
//     gmail    GMAIL_CLIENT_ID + GMAIL_CLIENT_SECRET + GMAIL_REFRESH_TOKEN
//              (Gmail REST API over HTTPS — sends from your Gmail account)
//     smtp     EMAIL_HOST + EMAIL_USER + EMAIL_PASS (works locally / on paid hosts)
//
//   EMAIL_PROVIDER=auto (default) uses every configured provider in the order
//   above and falls back to the next one if a provider fails.

const nodemailer = require('nodemailer');
const MailComposer = require('nodemailer/lib/mail-composer');

const HTTP_TIMEOUT_MS = Number(process.env.EMAIL_HTTP_TIMEOUT_MS || 15000);
const SMTP_TIMEOUT_MS = Number(process.env.EMAIL_SMTP_TIMEOUT_MS || 15000);
const PROVIDER_ORDER = ['brevo', 'resend', 'sendgrid', 'gmail', 'smtp'];
const PROVIDER_ALIASES = {
  sendinblue: 'brevo',
  'gmail-api': 'gmail',
  gmail_api: 'gmail',
  gmailapi: 'gmail',
  nodemailer: 'smtp'
};

// ---------- helpers ----------

/** Read an env var, trimming whitespace and accidental surrounding quotes. */
function env(name) {
  const raw = process.env[name];
  if (raw === undefined || raw === null) return '';
  return String(raw).trim().replace(/^(['"])(.*)\1$/, '$2').trim();
}

class MailError extends Error {
  constructor(message, { code = 'EMAIL_FAILED', provider = null, status = 502, hint = null, cause = null, transient = false } = {}) {
    super(message);
    this.name = 'MailError';
    this.code = code;
    this.provider = provider;
    this.status = status;
    this.hint = hint;
    this.transient = transient;
    if (cause) this.cause = cause;
  }
}

/** Parse "Name <email@x.com>" or "email@x.com". */
function parseAddress(value) {
  const input = String(value || '').trim();
  if (!input) return null;
  const match = input.match(/^\s*"?([^"<]*?)"?\s*<\s*([^>\s]+@[^>\s]+)\s*>\s*$/);
  if (match) return { name: match[1].trim() || null, email: match[2].trim() };
  if (/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(input)) return { name: null, email: input };
  return null;
}

function formatAddress({ name, email }) {
  if (!name) return email;
  return `"${name.replace(/"/g, "'")}" <${email}>`;
}

/** Sender identity shared by all providers. */
function getSender() {
  const parsed = parseAddress(env('EMAIL_FROM'));
  const fallbackEmail = env('EMAIL_FROM_ADDRESS') || env('EMAIL_USER');
  const name = (parsed && parsed.name) || env('EMAIL_FROM_NAME') || 'Youth Assam';
  const email = (parsed && parsed.email) || fallbackEmail;
  return email ? { name, email } : null;
}

function redact(text) {
  return String(text || '')
    .replace(/(api[-_ ]?key|authorization|bearer|password|pass|secret|token)(["'\s:=]+)[^\s,;"']+/gi, '$1$2[redacted]')
    .slice(0, 500);
}

async function httpRequest(provider, url, { method = 'POST', headers = {}, body, form } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HTTP_TIMEOUT_MS);
  let response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        Accept: 'application/json',
        ...(form ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...headers
      },
      body: form ? new URLSearchParams(form).toString() : body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal
    });
  } catch (error) {
    const timedOut = error && error.name === 'AbortError';
    throw new MailError(
      timedOut ? `${provider} API did not respond within ${HTTP_TIMEOUT_MS / 1000}s` : `Could not reach ${provider} API: ${error.message}`,
      { code: timedOut ? 'ETIMEDOUT' : 'ECONNECTION', provider, transient: true, cause: error }
    );
  } finally {
    clearTimeout(timer);
  }

  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = null; }

  if (!response.ok) {
    const detail = (data && (data.message || data.error_description || (data.error && (data.error.message || data.error)) ||
      (Array.isArray(data.errors) && data.errors.map((e) => e.message).join('; ')))) || text || response.statusText;
    const authFailure = response.status === 401 || response.status === 403;
    throw new MailError(`${provider} API error ${response.status}: ${redact(typeof detail === 'string' ? detail : JSON.stringify(detail))}`, {
      code: authFailure ? 'EAUTH' : `HTTP_${response.status}`,
      provider,
      transient: response.status === 429 || response.status >= 500,
      hint: authFailure ? `Check the ${provider} API key / credentials and that the sender address is verified.` : null
    });
  }
  return data;
}

// ---------- providers ----------

const providers = {
  brevo: {
    isConfigured: () => Boolean(env('BREVO_API_KEY')),
    missing: () => ['BREVO_API_KEY'].filter((k) => !env(k)),
    async send(message) {
      const data = await httpRequest('brevo', 'https://api.brevo.com/v3/smtp/email', {
        headers: { 'api-key': env('BREVO_API_KEY') },
        body: {
          sender: { email: message.from.email, ...(message.from.name ? { name: message.from.name } : {}) },
          to: [{ email: message.to }],
          subject: message.subject,
          htmlContent: message.html,
          textContent: message.text,
          ...(message.replyTo ? { replyTo: { email: message.replyTo } } : {})
        }
      });
      return { id: data && data.messageId };
    },
    async verify() {
      await httpRequest('brevo', 'https://api.brevo.com/v3/account', { method: 'GET', headers: { 'api-key': env('BREVO_API_KEY') } });
    }
  },

  resend: {
    isConfigured: () => Boolean(env('RESEND_API_KEY')),
    missing: () => ['RESEND_API_KEY'].filter((k) => !env(k)),
    async send(message) {
      const data = await httpRequest('resend', 'https://api.resend.com/emails', {
        headers: { Authorization: `Bearer ${env('RESEND_API_KEY')}` },
        body: {
          from: formatAddress(message.from),
          to: [message.to],
          subject: message.subject,
          html: message.html,
          text: message.text,
          ...(message.replyTo ? { reply_to: message.replyTo } : {})
        }
      });
      return { id: data && data.id };
    },
    // Resend "sending access" keys cannot call read endpoints; config check only.
    async verify() {}
  },

  sendgrid: {
    isConfigured: () => Boolean(env('SENDGRID_API_KEY')),
    missing: () => ['SENDGRID_API_KEY'].filter((k) => !env(k)),
    async send(message) {
      await httpRequest('sendgrid', 'https://api.sendgrid.com/v3/mail/send', {
        headers: { Authorization: `Bearer ${env('SENDGRID_API_KEY')}` },
        body: {
          personalizations: [{ to: [{ email: message.to }] }],
          from: { email: message.from.email, ...(message.from.name ? { name: message.from.name } : {}) },
          ...(message.replyTo ? { reply_to: { email: message.replyTo } } : {}),
          subject: message.subject,
          content: [
            { type: 'text/plain', value: message.text },
            { type: 'text/html', value: message.html }
          ]
        }
      });
      return { id: null };
    },
    async verify() {
      await httpRequest('sendgrid', 'https://api.sendgrid.com/v3/scopes', { method: 'GET', headers: { Authorization: `Bearer ${env('SENDGRID_API_KEY')}` } });
    }
  },

  gmail: {
    isConfigured: () => Boolean(env('GMAIL_CLIENT_ID') && env('GMAIL_CLIENT_SECRET') && env('GMAIL_REFRESH_TOKEN')),
    missing: () => ['GMAIL_CLIENT_ID', 'GMAIL_CLIENT_SECRET', 'GMAIL_REFRESH_TOKEN'].filter((k) => !env(k)),
    _token: null,
    _tokenExpiresAt: 0,
    async accessToken() {
      if (this._token && Date.now() < this._tokenExpiresAt - 60000) return this._token;
      let data;
      try {
        data = await httpRequest('gmail', 'https://oauth2.googleapis.com/token', {
          form: {
            client_id: env('GMAIL_CLIENT_ID'),
            client_secret: env('GMAIL_CLIENT_SECRET'),
            refresh_token: env('GMAIL_REFRESH_TOKEN'),
            grant_type: 'refresh_token'
          }
        });
      } catch (error) {
        if (error.code === 'HTTP_400' || error.code === 'EAUTH') {
          error.code = 'EAUTH';
          error.hint = 'Gmail OAuth refresh token was rejected (expired/revoked, or the OAuth app is still in "Testing" mode which expires tokens after 7 days). Generate a new GMAIL_REFRESH_TOKEN.';
        }
        throw error;
      }
      this._token = data.access_token;
      this._tokenExpiresAt = Date.now() + Number(data.expires_in || 3600) * 1000;
      return this._token;
    },
    async send(message) {
      const raw = await new MailComposer({
        from: formatAddress(message.from),
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
        ...(message.replyTo ? { replyTo: message.replyTo } : {})
      }).compile().build();
      const token = await this.accessToken();
      const data = await httpRequest('gmail', 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        headers: { Authorization: `Bearer ${token}` },
        body: { raw: raw.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') }
      });
      return { id: data && data.id };
    },
    async verify() {
      await this.accessToken();
    }
  },

  smtp: {
    isConfigured: () => Boolean(env('EMAIL_HOST') && env('EMAIL_USER') && env('EMAIL_PASS')),
    missing: () => ['EMAIL_HOST', 'EMAIL_USER', 'EMAIL_PASS'].filter((k) => !env(k)),
    _transporters: new Map(),
    settings() {
      const host = env('EMAIL_HOST');
      const port = Number(env('EMAIL_PORT') || 587);
      const secureEnv = env('EMAIL_SECURE').toLowerCase();
      const secure = secureEnv ? secureEnv === 'true' : port === 465;
      // Google app passwords are shown as "abcd efgh ijkl mnop" — spaces must be removed.
      const isGmail = /(^|\.)gmail\.com$|googlemail\.com$/i.test(host);
      const pass = isGmail ? env('EMAIL_PASS').replace(/\s+/g, '') : env('EMAIL_PASS');
      return { host, port, secure, user: env('EMAIL_USER'), pass, isGmail };
    },
    transporter(port, secure) {
      const s = this.settings();
      const key = `${s.host}:${port}:${secure}:${s.user}`;
      if (!this._transporters.has(key)) {
        this._transporters.set(key, nodemailer.createTransport({
          host: s.host,
          port,
          secure,
          requireTLS: !secure,
          auth: { user: s.user, pass: s.pass },
          // Many PaaS hosts have no IPv6 egress; smtp.gmail.com resolves to IPv6 first → ENETUNREACH.
          ...(env('EMAIL_FORCE_IPV4').toLowerCase() === 'false' ? {} : { family: 4 }),
          // No pooling: nodemailer's pool re-queues forever when a firewall keeps closing
          // the connection, which made /api/otp/send hang. One connection per mail is fine for OTP volume.
          connectionTimeout: SMTP_TIMEOUT_MS,
          greetingTimeout: SMTP_TIMEOUT_MS,
          socketTimeout: SMTP_TIMEOUT_MS * 2,
          tls: {
            ...(require('net').isIP(s.host) ? {} : { servername: s.host }),
            minVersion: 'TLSv1.2',
            // Only for self-signed/internal relays. Never needed for Gmail/Brevo/etc.
            ...(env('EMAIL_TLS_REJECT_UNAUTHORIZED').toLowerCase() === 'false' ? { rejectUnauthorized: false } : {})
          }
        }));
      }
      return this._transporters.get(key);
    },
    /** Configured port first, then the other standard submission port as fallback. */
    attempts() {
      const s = this.settings();
      const list = [{ port: s.port, secure: s.secure }];
      if (env('EMAIL_PORT_FALLBACK').toLowerCase() !== 'false') {
        if (s.port === 587) list.push({ port: 465, secure: true });
        else if (s.port === 465) list.push({ port: 587, secure: false });
      }
      return list;
    },
    async run(fn) {
      let lastError;
      for (const { port, secure } of this.attempts()) {
        try {
          return await fn(this.transporter(port, secure));
        } catch (error) {
          lastError = normalizeSmtpError(error, this.settings());
          // Only connection-level failures are worth retrying on another port.
          if (!lastError.transient) break;
        }
      }
      throw lastError;
    },
    async send(message) {
      const s = this.settings();
      // Gmail (and most SMTP servers) reject or rewrite a From that differs from the login.
      const from = s.isGmail && message.from.email.toLowerCase() !== s.user.toLowerCase()
        ? { name: message.from.name, email: s.user }
        : message.from;
      const info = await this.run((t) => t.sendMail({
        from: formatAddress(from),
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
        ...(message.replyTo ? { replyTo: message.replyTo } : {})
      }));
      if (info && Array.isArray(info.rejected) && info.rejected.length) {
        throw new MailError(`SMTP server rejected recipient ${info.rejected.join(', ')}`, { code: 'EENVELOPE', provider: 'smtp', status: 400 });
      }
      return { id: info && info.messageId };
    },
    async verify() {
      await this.run((t) => t.verify());
    }
  }
};

function normalizeSmtpError(error, settings) {
  if (error instanceof MailError) return error;
  const code = error && (error.code || '');
  const responseCode = error && error.responseCode;
  const connectionCodes = ['ETIMEDOUT', 'ECONNECTION', 'ECONNREFUSED', 'ECONNRESET', 'ENETUNREACH', 'EHOSTUNREACH', 'ESOCKET', 'EDNS', 'ENOTFOUND', 'EAI_AGAIN'];
  if (code === 'EAUTH' || responseCode === 535 || responseCode === 534) {
    return new MailError(`SMTP login rejected by ${settings.host} (${responseCode || code})`, {
      code: 'EAUTH', provider: 'smtp', cause: error,
      hint: settings.isGmail
        ? 'Gmail needs a 16-character App Password (Google Account → Security → 2-Step Verification → App passwords). Your normal Gmail password will not work. EMAIL_USER must be the same Gmail address.'
        : 'Check EMAIL_USER / EMAIL_PASS.'
    });
  }
  // Firewalled SMTP often surfaces as a bare "Connection closed" (no code) or a TLS socket reset.
  const networkMessage = /timeout|timed out|greeting never received|connection closed|socket disconnected|socket hang up|unexpected socket close/i;
  if (connectionCodes.includes(code) || (!responseCode && networkMessage.test(error && error.message))) {
    return new MailError(`Cannot connect to SMTP server ${settings.host}: ${error.message}`, {
      code: 'ECONNECTION', provider: 'smtp', transient: true, cause: error,
      hint: 'Outbound SMTP is blocked by many hosts (Render FREE blocks ports 25/465/587). Set BREVO_API_KEY (or RESEND_API_KEY / SENDGRID_API_KEY / Gmail API credentials) to send over HTTPS instead.'
    });
  }
  return new MailError(`SMTP error: ${error && error.message}`, { code: code || 'ESMTP', provider: 'smtp', cause: error });
}

// ---------- provider selection ----------

function normalizeProviderName(name) {
  const key = String(name || '').trim().toLowerCase();
  return PROVIDER_ALIASES[key] || key;
}

/** Ordered list of providers to try. */
function getProviderChain() {
  const requested = normalizeProviderName(env('EMAIL_PROVIDER') || 'auto');
  const configured = PROVIDER_ORDER.filter((name) => providers[name].isConfigured());
  if (requested && requested !== 'auto') {
    if (!providers[requested]) {
      throw new MailError(`Unknown EMAIL_PROVIDER "${requested}". Use one of: auto, ${PROVIDER_ORDER.join(', ')}.`, { code: 'EMAIL_NOT_CONFIGURED', status: 503 });
    }
    if (!providers[requested].isConfigured()) {
      throw new MailError(`EMAIL_PROVIDER=${requested} but ${providers[requested].missing().join(', ')} ${providers[requested].missing().length > 1 ? 'are' : 'is'} not set.`, { code: 'EMAIL_NOT_CONFIGURED', provider: requested, status: 503 });
    }
    const fallbacks = env('EMAIL_FALLBACK').toLowerCase() === 'false' ? [] : configured.filter((n) => n !== requested);
    return [requested, ...fallbacks];
  }
  if (!configured.length) {
    throw new MailError('No email provider is configured on the backend.', {
      code: 'EMAIL_NOT_CONFIGURED', status: 503,
      hint: 'Set BREVO_API_KEY (recommended on Render free), RESEND_API_KEY, SENDGRID_API_KEY, GMAIL_CLIENT_ID/GMAIL_CLIENT_SECRET/GMAIL_REFRESH_TOKEN, or EMAIL_HOST/EMAIL_USER/EMAIL_PASS.'
    });
  }
  return configured;
}

function describeConfig() {
  let chain = [];
  let configError = null;
  try { chain = getProviderChain(); } catch (error) { configError = error.message; }
  const sender = getSender();
  return {
    requested: normalizeProviderName(env('EMAIL_PROVIDER') || 'auto'),
    chain,
    configured: PROVIDER_ORDER.filter((n) => providers[n].isConfigured()),
    sender: sender ? sender.email : null,
    error: configError
  };
}

// ---------- public API ----------

async function sendMail({ to, subject, text, html, replyTo }) {
  const recipient = String(to || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
    throw new MailError('Invalid recipient email address.', { code: 'EENVELOPE', status: 400 });
  }
  const sender = getSender();
  if (!sender) {
    throw new MailError('EMAIL_FROM (or EMAIL_USER) is not configured on the backend.', { code: 'EMAIL_NOT_CONFIGURED', status: 503 });
  }

  const chain = getProviderChain();
  const message = { from: sender, to: recipient, subject, text, html, replyTo: replyTo || env('EMAIL_REPLY_TO') || undefined };
  const failures = [];

  for (const name of chain) {
    try {
      const result = await providers[name].send(message);
      if (failures.length) console.warn(`[mail] delivered via ${name} after failures: ${failures.map((f) => `${f.provider}: ${f.message}`).join(' | ')}`);
      return { provider: name, id: (result && result.id) || null };
    } catch (rawError) {
      const error = rawError instanceof MailError ? rawError : new MailError(rawError.message, { provider: name, cause: rawError });
      if (!error.provider) error.provider = name;
      failures.push(error);
      console.error(`[mail] ${name} failed: ${error.code} ${error.message}${error.hint ? ` — ${error.hint}` : ''}`);
      if (error.code === 'EENVELOPE') break; // bad recipient: other providers won't help
    }
  }

  const primary = failures.find((f) => f.code === 'EAUTH') || failures[failures.length - 1];
  const finalError = new MailError(
    failures.length > 1
      ? `All email providers failed (${failures.map((f) => `${f.provider}: ${f.code}`).join(', ')})`
      : primary.message,
    { code: primary.code, provider: primary.provider, status: primary.status, hint: primary.hint }
  );
  finalError.failures = failures.map((f) => ({ provider: f.provider, code: f.code, message: f.message, hint: f.hint }));
  throw finalError;
}

// Verification result is cached so /api/health doesn't hammer the provider
// (Gmail in particular rate-limits repeated SMTP logins).
let verifyCache = { at: 0, result: null };
const VERIFY_TTL_MS = 5 * 60 * 1000;

async function verifyMailer({ fresh = false } = {}) {
  if (!fresh && verifyCache.result && Date.now() - verifyCache.at < VERIFY_TTL_MS) {
    if (verifyCache.result.ok) return verifyCache.result;
    throw verifyCache.result.error;
  }
  try {
    const chain = getProviderChain();
    if (!getSender()) throw new MailError('EMAIL_FROM (or EMAIL_USER) is not configured on the backend.', { code: 'EMAIL_NOT_CONFIGURED', status: 503 });
    const failures = [];
    for (const name of chain) {
      try {
        await providers[name].verify();
        const result = { ok: true, provider: name, failures };
        verifyCache = { at: Date.now(), result };
        return result;
      } catch (error) {
        failures.push(error instanceof MailError ? error : new MailError(error.message, { provider: name, cause: error }));
      }
    }
    const err = failures.find((f) => f.code === 'EAUTH') || failures[failures.length - 1];
    err.failures = failures.map((f) => ({ provider: f.provider, code: f.code, message: f.message, hint: f.hint }));
    throw err;
  } catch (error) {
    verifyCache = { at: Date.now(), result: { ok: false, error } };
    throw error;
  }
}

function resetMailerCache() {
  verifyCache = { at: 0, result: null };
  providers.gmail._token = null;
  providers.gmail._tokenExpiresAt = 0;
  for (const t of providers.smtp._transporters.values()) {
    try { t.close(); } catch { /* ignore */ }
  }
  providers.smtp._transporters.clear();
}

// ---------- templated emails ----------

const templates = require('./emailTemplates');

async function sendOtpEmail(email, otp, { purpose = 'signup' } = {}) {
  const content = purpose === 'reset' ? templates.passwordResetOtp(otp) : templates.verificationOtp(otp);
  return sendMail({ to: email, ...content });
}

async function sendWelcomeEmail(email, displayName) {
  return sendMail({ to: email, ...templates.welcome(displayName) });
}

async function sendPasswordChangedEmail(email) {
  return sendMail({ to: email, ...templates.passwordChanged() });
}

module.exports = {
  MailError,
  sendMail,
  sendOtpEmail,
  sendWelcomeEmail,
  sendPasswordChangedEmail,
  verifyMailer,
  describeConfig,
  resetMailerCache,
  // exported for tests
  _internal: { parseAddress, getSender, getProviderChain, providers, normalizeSmtpError }
};
