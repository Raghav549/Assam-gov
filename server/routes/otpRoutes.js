const express = require('express');
const { sendOtp, verifyOtp } = require('../controllers/otpController');

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/send', sendOtp);
router.post('/verify', verifyOtp);

module.exports = router;
