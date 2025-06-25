// routes/simulationRoutes.js
const express = require('express');
const router = express.Router();
const simulationController = require('../controllers/simulationController');

// Define the simulation endpoint
router.post('/scan', simulationController.handleScan);

module.exports = router; 