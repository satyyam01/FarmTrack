// routes/verificationRoutes.js
const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');

// Send OTP to email
router.post('/send-otp', verificationController.sendVerificationOTP);

// Confirm OTP and complete registration
router.post('/confirm', verificationController.verifyOTPAndRegister);

module.exports = router;
