const express = require('express');
const router = express.Router();
const returnLogController = require('../controllers/returnLogController');
const { authenticate, authorize } = require('../middleware/auth');

// Require login for all return log routes
router.use(authenticate);

// Read operations
router.get('/', returnLogController.getReturnLogs);
router.get('/animal/:animalId', returnLogController.getReturnLogsByAnimal);

// Write operations restricted to admins
router.post('/', authorize('admin'), returnLogController.createReturnLog);
router.put('/:id', authorize('admin'), returnLogController.updateReturnLog);
router.delete('/:id', authorize('admin'), returnLogController.deleteReturnLog);

module.exports = router;
