// End-to-end API test: real HTTP requests → real SMTP delivery (local server)
// → read the code out of the delivered email → verify → verification token.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { SMTPServer } = require('smtp-server');
const jwt = require('jsonwebtoken');

for (const name of ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'BREVO_API_KEY', 'RESEND_API_KEY', 'SENDGRID_API_KEY', 'GMAIL_CLIENT_ID', 'EMAIL_PROVIDER']) delete process.env[name];
process.env.NODE_ENV = 'test';
process.env.OTP_STORE = 'memory';
process.env.JWT_SECRET = 'test-secret-for-otp-flow';
process.env.EMAIL_SEND_LIMIT_PER_15MIN = '100';

let smtp;
let server;
let base;
const inbox = [];

before(async () => {
  smtp = new SMTPServer({
    logger: false,
    onAuth: (auth, s, cb) => cb(null, { user: auth.username }),
    onData(stream, session, cb) {
      let raw = '';
      stream.on('data', (c) => { raw += c; });
      stream.on('end', () => { inbox.push({ to: session.envelope.rcptTo[0].address, raw }); cb(); });
    }
  });
  await new Promise((r) => smtp.listen(0, '127.0.0.1', r));
  Object.assign(process.env, {
    EMAIL_HOST: '127.0.0.1',
    EMAIL_PORT: String(smtp.server.address().port),
    EMAIL_USER: 'sender@example.com',
    EMAIL_PASS: 'pw',
    EMAIL_FROM: 'Youth Assam <sender@example.com>',
    EMAIL_TLS_REJECT_UNAUTHORIZED: 'false'
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

const post = async (path, body) => {
  const res = await fetch(base + path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  return { status: res.status, body: await res.json() };
};
const codeFor = (email) => {
  const mail = [...inbox].reverse().find((m) => m.to === email);
  return mail && mail.raw.match(/\b(\d{6})\b/)[1];
};

test('health reports email transport ready', async () => {
  const res = await fetch(`${base}/api/health?fresh=1`);
  const body = await res.json();
  assert.equal(body.smtp, 'ready');
  assert.equal(body.mail.provider, 'smtp');
  assert.equal(body.auth, 'custom-jwt');
});

test('send → receive real email → verify → verification token', async () => {
  const email = 'Student.One@Example.com ';
  const sent = await post('/api/otp/send', { email });
  assert.equal(sent.status, 200, JSON.stringify(sent.body));
  assert.equal(sent.body.ok, true);

  const otp = codeFor('student.one@example.com');
  assert.match(otp, /^\d{6}$/);

  const verified = await post('/api/otp/verify', { email: 'student.one@example.com', otp });
  assert.equal(verified.status, 200, JSON.stringify(verified.body));
  assert.equal(verified.body.verified, true);
  const payload = jwt.verify(verified.body.verificationToken, process.env.JWT_SECRET);
  assert.equal(payload.purpose, 'email_verification');
  assert.equal(payload.email, 'student.one@example.com');

  // single use
  const again = await post('/api/otp/verify', { email: 'student.one@example.com', otp });
  assert.equal(again.status, 400);
});

test('legacy route aliases still work', async () => {
  const sent = await post('/api/otp/send-otp', { email: 'alias@example.com' });
  assert.equal(sent.status, 200);
  const verified = await post('/api/otp/verify-otp', { email: 'alias@example.com', otp: codeFor('alias@example.com') });
  assert.equal(verified.body.verified, true);
});

test('resend cooldown is enforced', async () => {
  assert.equal((await post('/api/otp/send', { email: 'cool@example.com' })).status, 200);
  const second = await post('/api/otp/resend', { email: 'cool@example.com' });
  assert.equal(second.status, 429);
  assert.match(second.body.message, /wait \d+s/);
});

test('wrong codes count down and then lock', async () => {
  const email = 'wrong@example.com';
  await post('/api/otp/send', { email });
  const real = codeFor(email);
  const wrong = real === '000000' ? '111111' : '000000';
  let res;
  for (let i = 0; i < 4; i += 1) res = await post('/api/otp/verify', { email, otp: wrong });
  assert.match(res.body.message, /1 attempt left/);
  res = await post('/api/otp/verify', { email, otp: wrong });
  assert.match(res.body.message, /Too many/);
  res = await post('/api/otp/verify', { email, otp: real });
  assert.equal(res.status, 400); // locked → must request a new code
});

test('input validation', async () => {
  assert.equal((await post('/api/otp/send', { email: 'nope' })).status, 400);
  assert.equal((await post('/api/otp/verify', { email: 'a@b.com', otp: '12' })).status, 400);
  const bad = await fetch(`${base}/api/otp/send`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{bad' });
  assert.equal(bad.status, 400);
});

test('register without database gives a clear 503, not a crash', async () => {
  const email = 'nodb@example.com';
  await post('/api/otp/send', { email });
  const { body: v } = await post('/api/otp/verify', { email, otp: codeFor(email) });
  const res = await post('/api/auth/register', { email, password: 'Password1', displayName: 'No DB', verificationToken: v.verificationToken });
  assert.equal(res.status, 503);
  assert.match(res.body.message, /Database is not configured/);
});

test('mail failure returns 502 and lets the user retry immediately', async () => {
  const mailer = require('../mailer');
  const good = process.env.EMAIL_PASS;
  process.env.EMAIL_PORT = '1';
  process.env.EMAIL_PORT_FALLBACK = 'false';
  mailer.resetMailerCache();
  try {
    const res = await post('/api/otp/send', { email: 'fail@example.com' });
    assert.equal(res.status, 502);
    assert.match(res.body.message, /could not send/i);
    assert.equal(res.body.code, 'ECONNECTION');
  } finally {
    process.env.EMAIL_PORT = String(smtp.server.address().port);
    process.env.EMAIL_PASS = good;
    delete process.env.EMAIL_PORT_FALLBACK;
    mailer.resetMailerCache();
  }
  // no cooldown was consumed by the failed attempt
  assert.equal((await post('/api/otp/send', { email: 'fail@example.com' })).status, 200);
});

test('unknown API route → JSON 404', async () => {
  const res = await fetch(`${base}/api/nope`);
  assert.equal(res.status, 404);
  assert.equal((await res.json()).ok, false);
});
