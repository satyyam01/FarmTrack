const express = require('express');
const router = express.Router();
const returnLogController = require('../controllers/returnLogController');

// Create a return log
router.post('/', returnLogController.createReturnLog);

// Get all return logs
router.get('/', returnLogController.getAllReturnLogs);

// Get return logs by animal
router.get('/animal/:animalId', returnLogController.getReturnLogsByAnimal);

// Update a return log
router.put('/:id', returnLogController.updateReturnLog);

// Delete a return log
router.delete('/:id', returnLogController.deleteReturnLog);

module.exports = router;
