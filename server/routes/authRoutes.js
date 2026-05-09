// ============================================
// AUTH ROUTES
// ============================================

const express = require('express');
const router = express.Router();

const nodemailer = require('nodemailer');

// ============================================
// OTP STORE
// ============================================

const otpStore = {};

// ============================================
// MAIL TRANSPORTER
// ============================================

const transporter = nodemailer.createTransport({

  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,

  secure: false,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

});

// ============================================
// BASIC ROUTES
// ============================================

router.post('/register', (req, res) => {

  res.status(200).json({
    message: 'Use Firebase Auth for registration'
  });

});

router.post('/login', (req, res) => {

  res.status(200).json({
    message: 'Use Firebase Auth for login'
  });

});

// ============================================
// SEND OTP
// ============================================

router.post('/send-otp', async (req, res) => {

  try {

    const { email } = req.body;

    if (!email) {

      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });

    }

    // Generate OTP
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Save OTP
    otpStore[email] = otp;

    // Send Mail
    await transporter.sendMail({

      from: process.env.EMAIL_USER,

      to: email,

      subject: 'Youth Assam OTP Verification',

      html: `
        <div style="font-family:sans-serif;padding:20px">
          <h2>Youth Assam OTP</h2>
          <p>Your verification OTP is:</p>
          <h1>${otp}</h1>
          <p>This OTP expires soon.</p>
        </div>
      `

    });

    return res.status(200).json({

      success: true,
      message: 'OTP sent successfully'

    });

  } catch (error) {

    console.log('OTP ERROR:', error);

    return res.status(500).json({

      success: false,
      message: 'Failed to send OTP',
      error: error.message

    });

  }

});

// ============================================
// VERIFY OTP
// ============================================

router.post('/verify-otp', async (req, res) => {

  try {

    const { email, otp } = req.body;

    if (!email || !otp) {

      return res.status(400).json({
        success: false,
        message: 'Email and OTP required'
      });

    }

    const savedOtp = otpStore[email];

    if (savedOtp !== otp) {

      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });

    }

    delete otpStore[email];

    return res.status(200).json({

      success: true,
      message: 'OTP verified successfully'

    });

  } catch (error) {

    console.log('VERIFY OTP ERROR:', error);

    return res.status(500).json({

      success: false,
      error: error.message

    });

  }

});

module.exports = router;
