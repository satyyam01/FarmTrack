const express = require('express');
const router = express.Router();
const returnLogController = require('../controllers/returnLogController');

// Get return logs (with optional date query parameter)
router.get('/', returnLogController.getReturnLogs);

// Get return logs by animal
router.get('/animal/:animalId', returnLogController.getReturnLogsByAnimal);

// Create a new return log
router.post('/', returnLogController.createReturnLog);

// Update a return log
router.put('/:id', returnLogController.updateReturnLog);

// Delete a return log
router.delete('/:id', returnLogController.deleteReturnLog);

module.exports = router;
