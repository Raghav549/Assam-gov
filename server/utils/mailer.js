const nodemailer = require('nodemailer');

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (!host || !user || !pass) {
    throw new Error('Email service is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASS in Render environment variables.');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
}

async function sendOtpEmail(email, otp) {
  const transporter = createTransporter();
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER;
  const appName = process.env.APP_NAME || 'Youth Assam';

  await transporter.sendMail({
    from: `"${appName}" <${from}>`,
    to: email,
    subject: `${appName} email verification OTP`,
    text: `Your ${appName} verification OTP is ${otp}. It will expire in 10 minutes.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:16px"><h2 style="margin:0 0 12px;color:#0f172a">${appName} Email Verification</h2><p style="font-size:15px;color:#334155">Use this OTP to verify your email address.</p><div style="font-size:34px;font-weight:800;letter-spacing:8px;color:#2563eb;background:#eff6ff;padding:18px;border-radius:12px;text-align:center">${otp}</div><p style="font-size:13px;color:#64748b">This OTP expires in 10 minutes. Do not share it with anyone.</p></div>`
  });
}

module.exports = { sendOtpEmail };
