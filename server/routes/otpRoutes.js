const express = require('express');
const { sendOtp, verifyOtp } = require('../controllers/otpController');
const { emailSendLimiter, verifyLimiter } = require('../middleware/rateLimits');

const router = express.Router();

router.post(['/send', '/send-otp', '/resend'], emailSendLimiter, sendOtp);
router.post(['/verify', '/verify-otp'], verifyLimiter, verifyOtp);

module.exports = router;
