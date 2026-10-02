#!/usr/bin/env node
// Email diagnostics.
//   npm run mail:test                    → check configuration + provider connectivity
//   npm run mail:test -- you@example.com → also send a real test email
require('dotenv').config();
const { describeConfig, sendMail, _internal } = require('../mailer');

(async () => {
  const to = process.argv[2];
  const config = describeConfig();
  console.log('Email configuration');
  console.log('  EMAIL_PROVIDER :', config.requested);
  console.log('  configured     :', config.configured.join(', ') || '(none)');
  console.log('  send order     :', config.chain.join(' → ') || '(none)');
  console.log('  sender         :', config.sender || '(missing — set EMAIL_FROM)');
  if (config.error) console.log('  problem        :', config.error);
  console.log('');

  let anyOk = false;
  for (const name of config.configured) {
    process.stdout.write(`Checking ${name.padEnd(8)} … `);
    try {
      await _internal.providers[name].verify();
      anyOk = true;
      console.log('OK');
    } catch (error) {
      console.log(`FAILED  ${error.code || ''} ${error.message}`);
      if (error.hint) console.log(`           hint: ${error.hint}`);
    }
  }
  if (!config.configured.length) console.log('No provider configured. See README → "Email / OTP setup".');

  if (to) {
    console.log(`\nSending test email to ${to} …`);
    try {
      const result = await sendMail({
        to,
        subject: 'Youth Assam — test email',
        text: `This is a test email from the Youth Assam backend, sent at ${new Date().toISOString()}.`,
        html: `<p>This is a test email from the <strong>Youth Assam</strong> backend, sent at ${new Date().toISOString()}.</p>`
      });
      console.log(`Sent via ${result.provider}${result.id ? ` (id ${result.id})` : ''}. Check the inbox and spam folder.`);
      process.exit(0);
    } catch (error) {
      console.log(`FAILED: ${error.message}`);
      for (const f of error.failures || []) console.log(`  - ${f.provider}: ${f.code} ${f.message}${f.hint ? `\n      hint: ${f.hint}` : ''}`);
      if (!error.failures && error.hint) console.log(`  hint: ${error.hint}`);
      process.exit(1);
    }
  }
  process.exit(anyOk ? 0 : 1);
})();
