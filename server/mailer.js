const nodemailer = require('nodemailer');

function getEmailConfig() {
  const user = process.env.EMAIL_USER || process.env.EMAIL;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error('Email service is not configured. Set EMAIL_USER and EMAIL_PASS in Render environment variables.');
  }

  return {
    user: String(user).trim(),
    pass: String(pass).replace(/\s/g, '')
  };
}

function createTransporter() {
  const { user, pass } = getEmailConfig();

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000
  });
}

async function sendOtpEmail(email, otp) {
  const { user } = getEmailConfig();
  const transporter = createTransporter();

  return transporter.sendMail({
    from: process.env.EMAIL || user,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP is ${otp}. Do not share it.`
  });
}

module.exports = { sendOtpEmail };
