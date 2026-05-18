const nodemailer = require('nodemailer');

const getTransporter = () => {
  const user = process.env.EMAIL_USER || process.env.EMAIL;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error('Email config missing');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: String(user).trim(),
      pass: String(pass).replace(/\s/g, '')
    }
  });
};

const sendOtpEmail = async (email, otp) => {
  const user = process.env.EMAIL_USER || process.env.EMAIL;
  const transporter = getTransporter();

  return transporter.sendMail({
    from: String(user).trim(),
    to: email,
    subject: 'OTP Code',
    text: 'Your OTP is ' + otp + '. Do not share it.'
  });
};

module.exports = { sendOtpEmail };
