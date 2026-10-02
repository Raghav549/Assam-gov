#!/usr/bin/env node
// Local development mail catcher: an SMTP server that accepts every message
// and a tiny web page to read them. Lets you test signup / password reset
// codes without a real email account.
//
//   npm run dev:inbox
//   then run the backend with:
//     EMAIL_PROVIDER=smtp EMAIL_HOST=127.0.0.1 EMAIL_PORT=2525 EMAIL_USER=dev@localhost \
//     EMAIL_PASS=dev EMAIL_TLS_REJECT_UNAUTHORIZED=false npm start
//   and open http://localhost:8025
//
// Development only — never expose this publicly.
const http = require('http');
const { SMTPServer } = require('smtp-server');

const SMTP_PORT = Number(process.env.DEV_INBOX_SMTP_PORT || 2525);
const WEB_PORT = Number(process.env.DEV_INBOX_WEB_PORT || 8025);
const messages = [];

function decodeQP(text) {
  return text.replace(/=\r?\n/g, '').replace(/=([0-9A-F]{2})/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
}
function decodeHeader(value) {
  return value.replace(/\s*=\?UTF-8\?Q\?([^?]*)\?=\s*/gi, (_, t) => Buffer.from(decodeQP(t.replace(/_/g, ' ')), 'latin1').toString('utf8'));
}
function parse(raw) {
  const [head] = raw.split(/\r?\n\r?\n/);
  const unfolded = head.replace(/\r?\n[ \t]+/g, ' ');
  const header = (name) => ((unfolded.match(new RegExp(`^${name}:\\s*(.*)$`, 'im')) || [])[1] || '').trim();
  const textPart = raw.split(/Content-Type: text\/plain[^\n]*\n(?:[^\n]+\n)*?\r?\n/i)[1] || '';
  const text = Buffer.from(decodeQP(textPart.split(/\r?\n----_/)[0]), 'latin1').toString('utf8').trim();
  return { subject: decodeHeader(header('Subject')), from: header('From'), to: header('To'), text };
}

const smtp = new SMTPServer({
  logger: false,
  authOptional: true,
  onAuth: (auth, session, cb) => cb(null, { user: auth.username }),
  onData(stream, session, cb) {
    let raw = '';
    stream.on('data', (c) => { raw += c; });
    stream.on('end', () => {
      const msg = { ...parse(raw), receivedAt: new Date().toISOString() };
      messages.unshift(msg);
      messages.length = Math.min(messages.length, 100);
      console.log(`[dev-inbox] ${msg.to} — ${msg.subject}`);
      cb();
    });
  }
});
smtp.listen(SMTP_PORT, '0.0.0.0', () => console.log(`[dev-inbox] SMTP listening on :${SMTP_PORT}`));

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
http.createServer((req, res) => {
  if (req.url === '/api/messages') {
    res.writeHead(200, { 'content-type': 'application/json' });
    return res.end(JSON.stringify(messages));
  }
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.end(`<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="4"><title>Dev inbox</title>
<body style="font-family:system-ui;max-width:760px;margin:24px auto;padding:0 16px;background:#f8fafc">
<h1>📬 Dev inbox <small style="font-size:14px;color:#64748b">(auto-refreshes · ${messages.length} message${messages.length === 1 ? '' : 's'})</small></h1>
${messages.length ? '' : '<p style="color:#64748b">No emails yet. Request a verification code in the app.</p>'}
${messages.map((m) => {
    const code = (m.text.match(/\b(\d{6})\b/) || [])[1];
    return `<div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin:12px 0">
<div style="color:#64748b;font-size:13px">${esc(m.receivedAt)} · to <b>${esc(m.to)}</b></div>
<div style="font-weight:700;margin:6px 0">${esc(m.subject)}</div>
${code ? `<div style="font-size:30px;font-weight:800;letter-spacing:8px;color:#15803d">${code}</div>` : ''}
<pre style="white-space:pre-wrap;color:#334155">${esc(m.text)}</pre></div>`;
  }).join('')}
</body>`);
}).listen(WEB_PORT, '0.0.0.0', () => console.log(`[dev-inbox] web inbox on http://localhost:${WEB_PORT}`));
