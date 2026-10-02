// Register / login / me / forgot-password / reset-password against an
// in-memory stand-in for the Supabase users table, with real SMTP delivery.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { SMTPServer } = require('smtp-server');
const jwt = require('jsonwebtoken');

// ---- minimal fake of the supabase-js query builder used by userService ----
const tables = { users: [] };
function query(table) {
  const state = { filters: [], op: 'select', payload: null, single: false, maybe: false };
  const rows = () => tables[table].filter((r) => state.filters.every(([k, v]) => r[k] === v));
  const exec = () => {
    if (state.op === 'insert') {
      if (tables[table].some((r) => r.email === state.payload.email)) return { data: null, error: { code: '23505', message: 'duplicate key' } };
      const row = { id: String(tables[table].length + 1), ...state.payload };
      tables[table].push(row);
      return { data: row, error: null };
    }
    if (state.op === 'update') { rows().forEach((r) => Object.assign(r, state.payload)); return { data: null, error: null }; }
    const found = rows();
    if (state.single || state.maybe) return { data: found[0] || null, error: null };
    return { data: found, error: null };
  };
  const builder = {
    select() { return builder; },
    insert(p) { state.op = 'insert'; state.payload = p; return builder; },
    update(p) { state.op = 'update'; state.payload = p; return builder; },
    eq(k, v) { state.filters.push([k, v]); return builder; },
    limit() { return builder; },
    maybeSingle() { state.maybe = true; return builder; },
    single() { state.single = true; return builder; },
    then(resolve, reject) { return Promise.resolve(exec()).then(resolve, reject); }
  };
  return builder;
}
require.cache[path.join(__dirname, '..', 'utils', 'supabase.js')] = {
  id: 'fake-supabase', loaded: true,
  exports: { isSupabaseConfigured: () => true, getSupabaseAdmin: () => ({ from: query }) }
};

process.env.NODE_ENV = 'test';
process.env.OTP_STORE = 'memory';
process.env.JWT_SECRET = 'auth-flow-secret';
process.env.SUPABASE_JWT_SECRET = 'supabase-legacy-secret';
process.env.EMAIL_SEND_LIMIT_PER_15MIN = '100';
for (const name of ['BREVO_API_KEY', 'RESEND_API_KEY', 'SENDGRID_API_KEY', 'GMAIL_CLIENT_ID', 'EMAIL_PROVIDER']) delete process.env[name];

let smtp; let server; let base;
const inbox = [];

before(async () => {
  smtp = new SMTPServer({
    logger: false,
    onAuth: (a, s, cb) => cb(null, { user: a.username }),
    onData(stream, session, cb) {
      let raw = '';
      stream.on('data', (c) => { raw += c; });
      // unfold encoded-word headers + quoted-printable soft breaks so tests can grep easily
      stream.on('end', () => { inbox.push({ to: session.envelope.rcptTo[0].address, raw: raw.replace(/\?=\s+=\?UTF-8\?Q\?/g, '').replace(/=\r\n/g, '') }); cb(); });
    }
  });
  await new Promise((r) => smtp.listen(0, '127.0.0.1', r));
  Object.assign(process.env, {
    EMAIL_HOST: '127.0.0.1', EMAIL_PORT: String(smtp.server.address().port), EMAIL_USER: 'sender@example.com',
    EMAIL_PASS: 'pw', EMAIL_FROM: 'Youth Assam <sender@example.com>', EMAIL_TLS_REJECT_UNAUTHORIZED: 'false'
  });
  const app = require('../index');
  server = await new Promise((resolve) => { const s = app.listen(0, '127.0.0.1', () => resolve(s)); });
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  require('../mailer').resetMailerCache();
  await new Promise((r) => server.close(r));
  await new Promise((r) => smtp.close(r));
});

const call = async (method, p, body, token) => {
  const res = await fetch(base + p, {
    method,
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  return { status: res.status, body: await res.json() };
};
const latestMail = (email, subjectPattern) => [...inbox].reverse().find((m) => m.to === email && subjectPattern.test(m.raw));
const codeIn = (mail) => mail.raw.match(/\b(\d{6})\b/)[1];
const waitFor = async (fn) => { for (let i = 0; i < 50; i += 1) { const v = fn(); if (v) return v; await new Promise((r) => setTimeout(r, 20)); } return null; };

const EMAIL = 'new.student@example.com';

test('full signup: OTP email → verify → register → welcome email', async () => {
  assert.equal((await call('POST', '/api/otp/send', { email: EMAIL })).status, 200);
  const otp = codeIn(latestMail(EMAIL, /Email_Verification/));
  const { body: v } = await call('POST', '/api/otp/verify', { email: EMAIL, otp });

  const reg = await call('POST', '/api/auth/register', { email: EMAIL, password: 'Password1', displayName: 'New Student', verificationToken: v.verificationToken });
  assert.equal(reg.status, 201, JSON.stringify(reg.body));
  assert.equal(reg.body.user.email, EMAIL);
  assert.equal(reg.body.user.passwordHash, undefined, 'password hash must never be returned');
  assert.match(reg.body.user.uid, /^[0-9a-f-]{36}$/, 'uid must be a UUID');
  const sb = jwt.verify(reg.body.supabaseToken, 'supabase-legacy-secret');
  assert.equal(sb.sub, reg.body.user.uid);
  assert.equal(sb.role, 'authenticated');
  assert.ok(await waitFor(() => latestMail(EMAIL, /Subject: Welcome/)), 'welcome email delivered');
});

test('signup OTP refused for an already-registered email', async () => {
  const res = await call('POST', '/api/otp/send', { email: EMAIL });
  assert.equal(res.status, 409);
});

test('register rejects missing/forged verification', async () => {
  const forged = jwt.sign({ purpose: 'email_verification', email: 'x@example.com' }, 'wrong-secret');
  const res = await call('POST', '/api/auth/register', { email: 'x@example.com', password: 'Password1', displayName: 'X', verificationToken: forged });
  assert.equal(res.status, 400);
});

test('login + /me', async () => {
  assert.equal((await call('POST', '/api/auth/login', { email: EMAIL, password: 'wrong-pass' })).status, 401);
  const login = await call('POST', '/api/auth/login', { email: 'New.Student@Example.com', password: 'Password1' });
  assert.equal(login.status, 200);
  const me = await call('GET', '/api/auth/me', null, login.body.token);
  assert.equal(me.status, 200);
  assert.equal(me.body.user.displayName, 'New Student');
  assert.equal((await call('GET', '/api/auth/me', null, 'garbage')).status, 401);
});

test('forgot password → reset code email → reset → login with new password', async () => {
  const unknown = await call('POST', '/api/auth/forgot-password', { email: 'ghost@example.com' });
  assert.equal(unknown.status, 200, 'does not reveal unknown emails');
  assert.equal(inbox.filter((m) => m.to === 'ghost@example.com').length, 0);

  const res = await call('POST', '/api/auth/forgot-password', { email: EMAIL });
  assert.equal(res.status, 200);
  const otp = codeIn(latestMail(EMAIL, /Password_Reset_Code/));

  // a signup code can't be used as a reset code (purpose-bound)
  assert.equal((await call('POST', '/api/auth/reset-password', { email: EMAIL, otp: otp === '123456' ? '654321' : '123456', password: 'NewPassword2' })).status, 400);

  const reset = await call('POST', '/api/auth/reset-password', { email: EMAIL, otp, password: 'NewPassword2' });
  assert.equal(reset.status, 200, JSON.stringify(reset.body));
  assert.ok(await waitFor(() => latestMail(EMAIL, /Your_password_was_changed/)), 'password-changed email delivered');

  assert.equal((await call('POST', '/api/auth/login', { email: EMAIL, password: 'Password1' })).status, 401);
  assert.equal((await call('POST', '/api/auth/login', { email: EMAIL, password: 'NewPassword2' })).status, 200);
});
