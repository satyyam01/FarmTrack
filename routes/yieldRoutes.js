const express = require('express');
const router = express.Router();
const yieldController = require('../controllers/yieldController');
const { authenticate, authorize } = require('../middleware/auth');

// Require login for all yield routes
router.use(authenticate);

// Read routes (all logged-in users)
router.get('/', yieldController.getAllYields);
router.get('/animal/:animalId', yieldController.getYieldsByAnimal);
router.get('/overview', yieldController.getOverview);

// Write/delete routes (admin only)
router.post('/', authorize('admin'), yieldController.createYield);
router.put('/:id', authorize('admin'), yieldController.updateYield);
router.delete('/:id', authorize('admin'), yieldController.deleteYield);
router.delete('/clear/all', authorize('admin'), yieldController.clearAll);

module.exports = router;
