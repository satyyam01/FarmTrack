const express = require('express');
const router = express.Router();
const simulationController = require('../controllers/simulationController');
const { authenticate, authorize } = require('../middleware/auth');

// Require login for all simulation routes
router.use(authenticate);

// Allow only admins or farm workers to simulate RFID scans
router.post('/scan', authorize('admin', 'farm_worker'), simulationController.handleScan);

module.exports = router;
