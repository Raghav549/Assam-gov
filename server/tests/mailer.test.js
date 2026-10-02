const { test, beforeEach, after } = require('node:test');
const assert = require('node:assert/strict');
const { SMTPServer } = require('smtp-server');

const MAIL_VARS = [
  'EMAIL_PROVIDER', 'EMAIL_FALLBACK', 'EMAIL_FROM', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_SECURE',
  'EMAIL_PORT_FALLBACK', 'EMAIL_TLS_REJECT_UNAUTHORIZED', 'BREVO_API_KEY', 'RESEND_API_KEY', 'SENDGRID_API_KEY',
  'GMAIL_CLIENT_ID', 'GMAIL_CLIENT_SECRET', 'GMAIL_REFRESH_TOKEN', 'EMAIL_REPLY_TO'
];
const mailer = require('../mailer');
const realFetch = global.fetch;

beforeEach(() => {
  for (const name of MAIL_VARS) delete process.env[name];
  process.env.EMAIL_SMTP_TIMEOUT_MS = '3000';
  global.fetch = realFetch;
  mailer.resetMailerCache();
});
after(() => { global.fetch = realFetch; mailer.resetMailerCache(); });

function mockFetch(handler) {
  const calls = [];
  global.fetch = async (url, init = {}) => {
    const call = { url: String(url), method: init.method || 'GET', headers: init.headers || {}, body: init.body };
    calls.push(call);
    const { status = 200, json = {} } = (await handler(call)) || {};
    return new Response(JSON.stringify(json), { status, headers: { 'content-type': 'application/json' } });
  };
  return calls;
}

test('parseAddress handles "Name <email>" and bare emails', () => {
  const { parseAddress } = mailer._internal;
  assert.deepEqual(parseAddress('Youth Assam <a@b.com>'), { name: 'Youth Assam', email: 'a@b.com' });
  assert.deepEqual(parseAddress('"Youth Assam" <a@b.com>'), { name: 'Youth Assam', email: 'a@b.com' });
  assert.deepEqual(parseAddress('a@b.com'), { name: null, email: 'a@b.com' });
  assert.equal(parseAddress('not an email'), null);
});

test('env values with surrounding quotes are accepted', () => {
  process.env.EMAIL_FROM = '"Youth Assam <noreply@example.com>"';
  assert.deepEqual(mailer._internal.getSender(), { name: 'Youth Assam', email: 'noreply@example.com' });
});

test('auto provider order prefers HTTPS APIs over SMTP', () => {
  process.env.EMAIL_HOST = 'smtp.gmail.com';
  process.env.EMAIL_USER = 'u@gmail.com';
  process.env.EMAIL_PASS = 'x';
  process.env.RESEND_API_KEY = 're_x';
  process.env.BREVO_API_KEY = 'xkeysib';
  assert.deepEqual(mailer._internal.getProviderChain(), ['brevo', 'resend', 'smtp']);
  process.env.EMAIL_PROVIDER = 'smtp';
  assert.deepEqual(mailer._internal.getProviderChain(), ['smtp', 'brevo', 'resend']);
  process.env.EMAIL_FALLBACK = 'false';
  assert.deepEqual(mailer._internal.getProviderChain(), ['smtp']);
});

test('clear error when nothing is configured', async () => {
  process.env.EMAIL_FROM = 'a@b.com';
  await assert.rejects(mailer.sendMail({ to: 'x@y.com', subject: 's', text: 't', html: 'h' }), (e) => e.code === 'EMAIL_NOT_CONFIGURED' && /BREVO_API_KEY/.test(e.hint));
  process.env.EMAIL_PROVIDER = 'resend';
  await assert.rejects(mailer.sendMail({ to: 'x@y.com', subject: 's', text: 't', html: 'h' }), /RESEND_API_KEY is not set/);
});

test('brevo request payload', async () => {
  process.env.BREVO_API_KEY = 'xkeysib-123';
  process.env.EMAIL_FROM = 'Youth Assam <sender@gmail.com>';
  const calls = mockFetch(() => ({ status: 201, json: { messageId: '<m1>' } }));
  const result = await mailer.sendOtpEmail('to@example.com', '123456');
  assert.deepEqual(result, { provider: 'brevo', id: '<m1>' });
  assert.equal(calls[0].url, 'https://api.brevo.com/v3/smtp/email');
  assert.equal(calls[0].headers['api-key'], 'xkeysib-123');
  const body = JSON.parse(calls[0].body);
  assert.deepEqual(body.sender, { email: 'sender@gmail.com', name: 'Youth Assam' });
  assert.deepEqual(body.to, [{ email: 'to@example.com' }]);
  assert.match(body.subject, /Youth Assam.*Email Verification OTP/);
  assert.match(body.textContent, /123456/);
  assert.match(body.htmlContent, /123456/);
});

test('resend + sendgrid request payloads', async () => {
  process.env.EMAIL_FROM = 'Youth Assam <noreply@example.com>';
  process.env.RESEND_API_KEY = 're_123';
  let calls = mockFetch(() => ({ json: { id: 'r1' } }));
  assert.equal((await mailer.sendOtpEmail('to@example.com', '111111')).provider, 'resend');
  assert.equal(calls[0].url, 'https://api.resend.com/emails');
  assert.equal(calls[0].headers.Authorization, 'Bearer re_123');
  assert.equal(JSON.parse(calls[0].body).from, '"Youth Assam" <noreply@example.com>');

  delete process.env.RESEND_API_KEY;
  process.env.SENDGRID_API_KEY = 'SG.x';
  calls = mockFetch(() => ({ status: 202 }));
  assert.equal((await mailer.sendOtpEmail('to@example.com', '222222', { purpose: 'reset' })).provider, 'sendgrid');
  const body = JSON.parse(calls[0].body);
  assert.deepEqual(body.personalizations, [{ to: [{ email: 'to@example.com' }] }]);
  assert.match(body.subject, /Password Reset/);
});

test('gmail API: refresh token exchange then raw MIME send', async () => {
  process.env.GMAIL_CLIENT_ID = 'cid';
  process.env.GMAIL_CLIENT_SECRET = 'secret';
  process.env.GMAIL_REFRESH_TOKEN = 'refresh';
  process.env.EMAIL_FROM = 'Youth Assam <me@gmail.com>';
  const calls = mockFetch((call) => (call.url.includes('oauth2')
    ? { json: { access_token: 'ya29.token', expires_in: 3600 } }
    : { json: { id: 'g1' } }));
  const result = await mailer.sendOtpEmail('to@example.com', '333333');
  assert.deepEqual(result, { provider: 'gmail', id: 'g1' });
  assert.match(calls[0].body, /grant_type=refresh_token/);
  assert.equal(calls[1].headers.Authorization, 'Bearer ya29.token');
  const raw = Buffer.from(JSON.parse(calls[1].body).raw.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString();
  assert.match(raw, /To: to@example\.com/);
  assert.match(raw, /333333/);
  // access token is cached
  await mailer.sendOtpEmail('to@example.com', '444444');
  assert.equal(calls.filter((c) => c.url.includes('oauth2')).length, 1);
});

test('falls back to the next provider when one fails', async () => {
  process.env.BREVO_API_KEY = 'bad';
  process.env.RESEND_API_KEY = 're_ok';
  process.env.EMAIL_FROM = 'noreply@example.com';
  mockFetch((call) => (call.url.includes('brevo') ? { status: 401, json: { message: 'Key not found' } } : { json: { id: 'ok' } }));
  const result = await mailer.sendMail({ to: 'to@example.com', subject: 's', text: 't', html: 'h' });
  assert.equal(result.provider, 'resend');
});

test('reports every failure when all providers fail', async () => {
  process.env.BREVO_API_KEY = 'bad';
  process.env.EMAIL_FROM = 'noreply@example.com';
  mockFetch(() => ({ status: 401, json: { message: 'Key not found', code: 'unauthorized' } }));
  await assert.rejects(mailer.sendMail({ to: 'to@example.com', subject: 's', text: 't', html: 'h' }), (e) => e.code === 'EAUTH' && /brevo API error 401/.test(e.message));
});

// ---------- real SMTP round trip against a local server ----------

function startSmtp({ user = 'sender@example.com', pass = 'app-password' } = {}) {
  const received = [];
  const server = new SMTPServer({
    authOptional: false,
    disabledCommands: [],
    logger: false,
    onAuth(auth, session, cb) {
      if (auth.username === user && auth.password === pass) return cb(null, { user });
      const err = new Error('5.7.8 Username and Password not accepted');
      err.responseCode = 535;
      return cb(err);
    },
    onData(stream, session, cb) {
      let raw = '';
      stream.on('data', (c) => { raw += c; });
      stream.on('end', () => { received.push({ raw, from: session.envelope.mailFrom.address, to: session.envelope.rcptTo.map((r) => r.address) }); cb(); });
    }
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ server, port: server.server.address().port, received })));
}

test('SMTP: real STARTTLS send to a local server', async () => {
  const smtp = await startSmtp();
  try {
    Object.assign(process.env, {
      EMAIL_HOST: '127.0.0.1', EMAIL_PORT: String(smtp.port), EMAIL_USER: 'sender@example.com', EMAIL_PASS: 'app-password',
      EMAIL_FROM: 'Youth Assam <sender@example.com>', EMAIL_TLS_REJECT_UNAUTHORIZED: 'false'
    });
    await mailer.verifyMailer({ fresh: true });
    const result = await mailer.sendOtpEmail('student@example.com', '987654');
    assert.equal(result.provider, 'smtp');
    assert.equal(smtp.received.length, 1);
    assert.deepEqual(smtp.received[0].to, ['student@example.com']);
    assert.match(smtp.received[0].raw, /987654/);
    assert.match(smtp.received[0].raw, /Subject: =\?UTF-8\?Q\?Youth_Assam_=E2=80=94_Email_Verification/);
  } finally {
    mailer.resetMailerCache();
    await new Promise((r) => smtp.server.close(r));
  }
});

test('SMTP: wrong password → EAUTH with app-password hint (no port fallback)', async () => {
  const smtp = await startSmtp();
  try {
    Object.assign(process.env, {
      EMAIL_HOST: '127.0.0.1', EMAIL_PORT: String(smtp.port), EMAIL_USER: 'sender@example.com', EMAIL_PASS: 'wrong',
      EMAIL_FROM: 'sender@example.com', EMAIL_TLS_REJECT_UNAUTHORIZED: 'false'
    });
    await assert.rejects(mailer.sendOtpEmail('student@example.com', '111111'), (e) => e.code === 'EAUTH' && /535/.test(e.message));
  } finally {
    mailer.resetMailerCache();
    await new Promise((r) => smtp.server.close(r));
  }
});

test('SMTP: blocked port → ECONNECTION with HTTPS-provider hint', async () => {
  Object.assign(process.env, {
    EMAIL_HOST: '127.0.0.1', EMAIL_PORT: '1', EMAIL_USER: 'sender@example.com', EMAIL_PASS: 'x', EMAIL_FROM: 'sender@example.com'
  });
  await assert.rejects(mailer.sendOtpEmail('student@example.com', '111111'), (e) => e.code === 'ECONNECTION' && /BREVO_API_KEY/.test(e.hint));
});
