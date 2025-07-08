const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Test Razorpay connection
router.get('/test-connection', paymentController.testConnection);

// Create Razorpay order for farm premium upgrade
router.post('/create-order', paymentController.createOrder);

// Verify Razorpay payment and activate premium
router.post('/verify', paymentController.verifyPayment);

module.exports = router; 