const nodemailer = require('nodemailer');

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured on the backend.`);
  return String(value).trim();
}

function createTransporter() {
  const host = required('EMAIL_HOST');
  const port = Number(process.env.EMAIL_PORT || 587);
  const user = required('EMAIL_USER');
  const pass = required('EMAIL_PASS').replace(/\s/g, '');

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000
  });
}

async function verifyMailer() {
  const transporter = createTransporter();
  await transporter.verify();
}

async function sendOtpEmail(email, otp) {
  const user = required('EMAIL_USER');
  const from = process.env.EMAIL_FROM || user;
  const transporter = createTransporter();

  return transporter.sendMail({
    from,
    to: email,
    subject: 'Youth Assam — Email Verification OTP',
    text: `Your Youth Assam verification OTP is ${otp}. It expires in 10 minutes. Do not share this code with anyone.`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937"><h2>Youth Assam Email Verification</h2><p>Your verification OTP is:</p><div style="font-size:32px;font-weight:700;letter-spacing:8px;margin:20px 0">${otp}</div><p>This code expires in <strong>10 minutes</strong>.</p><p>Please do not share this code with anyone.</p></div>`
  });
}

module.exports = { sendOtpEmail, verifyMailer };
