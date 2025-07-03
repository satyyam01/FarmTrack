const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);
router.delete('/account', authenticate, authController.deleteAccount);
router.post('/password/request-otp', authenticate, authController.requestPasswordChangeOTP);
router.post('/password/change', authenticate, authController.changePasswordWithOTP);

module.exports = router; 