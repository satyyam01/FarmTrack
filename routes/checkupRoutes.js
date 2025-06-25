const express = require('express');
const router = express.Router();
const checkupController = require('../controllers/checkupController');
const { authenticate, authorize } = require('../middleware/auth');

// Require authentication for all checkup routes
router.use(authenticate);

// Routes
router.get('/', checkupController.getAllCheckups);
router.get('/animal/:animalId', checkupController.getCheckupsByAnimal);

// Admin-only routes
router.post('/', authorize('admin'), checkupController.createCheckup);
router.put('/:id', authorize('admin'), checkupController.updateCheckup);
router.delete('/:id', authorize('admin'), checkupController.deleteCheckup);

module.exports = router;
