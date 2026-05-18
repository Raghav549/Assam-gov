const nodemailer = require('nodemailer');

function getCredentials() {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error('Email service is not configured. Set EMAIL_USER and EMAIL_PASS in Render environment variables.');
  }
  return { user, pass: String(pass).replace(/\s/g, '') };
}

function createGmailServiceTransporter() {
  const { user, pass } = getCredentials();
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
    pool: false,
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 20000
  });
}

function createSmtpTransporter(port) {
  const { user, pass } = getCredentials();
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port,
    secure: port === 465,
    requireTLS: port === 587,
    auth: { user, pass },
    pool: false,
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 20000
  });
}

async function trySend(transporter, mailOptions) {
  await transporter.verify();
  return transporter.sendMail(mailOptions);
}

async function sendOtpEmail(email, otp) {
  const { user } = getCredentials();
  const from = process.env.MAIL_FROM || user;
  const appName = process.env.APP_NAME || 'Youth Assam';
  const mailOptions = {
    from: `"${appName}" <${from}>`,
    to: email,
    subject: `${appName} email verification OTP`,
    text: `Your ${appName} verification OTP is ${otp}. It will expire in 10 minutes.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:16px"><h2 style="margin:0 0 12px;color:#0f172a">${appName} Email Verification</h2><p style="font-size:15px;color:#334155">Use this OTP to verify your email address.</p><div style="font-size:34px;font-weight:800;letter-spacing:8px;color:#2563eb;background:#eff6ff;padding:18px;border-radius:12px;text-align:center">${otp}</div><p style="font-size:13px;color:#64748b">This OTP expires in 10 minutes. Do not share it with anyone.</p></div>`
  };

  const attempts = [
    { name: 'gmail-service', transporter: createGmailServiceTransporter() },
    { name: 'gmail-587', transporter: createSmtpTransporter(587) },
    { name: 'gmail-465', transporter: createSmtpTransporter(465) }
  ];

  const errors = [];
  for (const attempt of attempts) {
    try {
      return await trySend(attempt.transporter, mailOptions);
    } catch (error) {
      errors.push(`${attempt.name}: ${error.code || error.message}`);
    }
  }

  throw new Error(`Email sending failed after Gmail attempts. ${errors.join(' | ')}`);
}

module.exports = { sendOtpEmail };
