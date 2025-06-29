const express = require('express');
const router = express.Router();
const { 
  getAllSettings, 
  getSetting, 
  updateSetting, 
  getNightCheckSchedule, 
  updateNightCheckSchedule,
  requestEmailChangeOTP,
  verifyEmailChangeOTP
} = require('../controllers/settingController');
const { authenticate, authorize } = require('../middleware/auth');

// Apply authentication to all routes
router.use(authenticate);

// General settings routes (all authenticated users can read, admin can write)
router.get('/', getAllSettings);
router.get('/:key', getSetting);
router.put('/:key', authorize('admin'), updateSetting);

// Night check schedule specific routes
// Anyone can read the schedule, but only admin can update it
router.get('/night-check/schedule', getNightCheckSchedule);
router.put('/night-check/schedule', authorize('admin'), updateNightCheckSchedule);

// Email change OTP endpoints
router.post('/request-email-change-otp', requestEmailChangeOTP);
router.post('/verify-email-change-otp', verifyEmailChangeOTP);

module.exports = router; 