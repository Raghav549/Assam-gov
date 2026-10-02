const express = require('express');
const { register, login, me, forgotPassword, resetPassword } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { emailSendLimiter, verifyLimiter, loginLimiter } = require('../middleware/rateLimits');

const router = express.Router();

router.post('/register', verifyLimiter, register);
router.post('/login', loginLimiter, login);
router.get('/me', authenticate, me);
router.post('/forgot-password', emailSendLimiter, forgotPassword);
router.post('/reset-password', verifyLimiter, resetPassword);

module.exports = router;
