const nodemailer = require('nodemailer');

function clean(value) {
  return String(value || '').trim();
}

function cleanPass(value) {
  return String(value || '').replace(/\s/g, '');
}

function getEmailConfig() {
  const user = clean(process.env.EMAIL_USER || process.env.EMAIL || process.env.GMAIL_USER);
  const pass = cleanPass(process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD || process.env.GMAIL_APP_PASSWORD);

  if (!user || !pass) {
    throw new Error('Email config missing. Add EMAIL_USER and EMAIL_PASS in Render Environment.');
  }

  return { user, pass };
}

function createTransport(options) {
  const { user, pass } = getEmailConfig();

  return nodemailer.createTransport({
    ...options,
    auth: { user, pass },
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 30000,
    tls: {
      rejectUnauthorized: true,
      servername: 'smtp.gmail.com'
    }
  });
}

async function trySend(transporter, mailOptions) {
  await transporter.verify();
  return transporter.sendMail(mailOptions);
}

const sendOtpEmail = async (email, otp) => {
  const { user } = getEmailConfig();
  const mailOptions = {
    from: user,
    to: email,
    subject: 'Your OTP Code',
    text: 'Your OTP is ' + otp + '. Do not share it.'
  };

  const attempts = [
    createTransport({ host: 'smtp.gmail.com', port: 465, secure: true }),
    createTransport({ host: 'smtp.gmail.com', port: 587, secure: false, requireTLS: true }),
    createTransport({ service: 'gmail' })
  ];

  const errors = [];

  for (const transporter of attempts) {
    try {
      return await trySend(transporter, mailOptions);
    } catch (error) {
      errors.push(error && (error.code || error.command || error.message) ? [error.code, error.command, error.message].filter(Boolean).join(':') : String(error));
    }
  }

  throw new Error('Email sending failed after gmail attempts. ' + errors.join(' | '));
};

module.exports = { sendOtpEmail };
