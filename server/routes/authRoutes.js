// ============================================
// AUTH ROUTES (Placeholder for future expansion)
// ============================================

const express = require('express');
const router = express.Router();

// Note: Actual Auth is handled by Firebase Client SDK
// These routes can be used for server-side actions like password resets if needed later

router.post('/register', (req, res) => {
res.status(200).json({ message: 'Use Firebase Auth for registration' });
});

router.post('/login', (req, res) => {
res.status(200).json({ message: 'Use Firebase Auth for login' });
});

module.exports = router;
