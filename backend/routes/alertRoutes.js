const express = require('express');
const router = express.Router();
const { fencingAlert, barnCheckAlert } = require('../controllers/alertController');
const { authenticate, authorize } = require('../middleware/auth');
const { sendEmail } = require('../utils/emailService');

// Test email endpoint
router.post('/test-email', authenticate, authorize('admin'), async (req, res) => {
  try {
    const result = await sendEmail({
      to: req.user.email,
      subject: '🧪 FarmTrack Email Test',
      html: '<h1>Email service is working!</h1><p>This is a test email from FarmTrack.</p>'
    });
    
    if (result.success) {
      res.json({ message: 'Test email sent successfully', messageId: result.messageId });
    } else {
      res.status(500).json({ error: 'Failed to send test email', details: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fencing alert - only admin can trigger
router.post('/fencing', authenticate, authorize('admin'), fencingAlert);

// Barn check - only admin can trigger
router.post('/barn-check', authenticate, authorize('admin'), barnCheckAlert);
router.get('/barn-check', authenticate, authorize('admin'), barnCheckAlert);

module.exports = router;
