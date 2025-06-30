// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const {
  getMyNotifications,
  markAsRead,
  deleteNotification,
  testNightCheck
} = require('../controllers/notificationController');

const checkAnimalReturnStatus = require('../utils/nightCheckLogic');

const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate); // All routes require authentication

// Get all notifications for the user
router.get('/', getMyNotifications);

// Mark notification as read
router.patch('/:id/read', markAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

// Manual trigger for night return check (admin only)
router.post('/night-check', authorize('admin'), async (req, res) => {
  try {
    await checkAnimalReturnStatus();
    res.json({ message: 'Night return check completed.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint for night check (admin only, farm-specific)
router.post('/test-night-check', authorize('admin'), testNightCheck);

module.exports = router;
