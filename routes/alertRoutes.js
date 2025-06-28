const express = require('express');
const router = express.Router();
const { fencingAlert, barnCheckAlert } = require('../controllers/alertController');
const { authenticate, authorize } = require('../middleware/auth');

// Fencing alert - only admin can trigger
router.post('/fencing', authenticate, authorize('admin'), fencingAlert);

// Barn check - only admin can trigger
router.post('/barn-check', authenticate, authorize('admin'), barnCheckAlert);
router.get('/barn-check', authenticate, authorize('admin'), barnCheckAlert);

module.exports = router;
