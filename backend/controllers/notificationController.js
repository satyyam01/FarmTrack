// controllers/notificationController.js
const Notification = require('../models/notification');
const checkAnimalReturnStatus = require('../utils/nightCheckLogic');

// Get all notifications for the logged-in user (farm-specific)
exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      farm_id: req.user.farm_id 
    }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, farm_id: req.user.farm_id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read', notification });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    // Only allow admins to delete notifications
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only farm owners can delete notifications' });
    }

    const result = await Notification.deleteOne({ 
      _id: req.params.id, 
      farm_id: req.user.farm_id 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

// Test night check (admin only, farm-specific)
exports.testNightCheck = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can run night checks' });
    }

    // Get farm_id from user
    const farmId = req.user.farm_id;
    if (!farmId) {
      return res.status(403).json({ error: 'Farm access required' });
    }

    // Run night check for this farm
    await checkAnimalReturnStatus(farmId);
    
    res.json({ 
      message: 'Night check completed successfully for your farm',
      farmId: farmId
    });
  } catch (error) {
    console.error('Error running test night check:', error);
    res.status(500).json({ error: 'Failed to run night check' });
  }
};
