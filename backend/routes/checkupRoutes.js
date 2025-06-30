const express = require('express');
const router = express.Router();
const checkupController = require('../controllers/checkupController');
const { authenticate, authorize } = require('../middleware/auth');

// Require authentication for all checkup routes
router.use(authenticate);

// Read operations: accessible to all logged-in users
router.get('/', checkupController.getAllCheckups);
router.get('/animal/:animalId', checkupController.getCheckupsByAnimal);

// Create operations: accessible to admin and veterinarian
router.post('/', authorize('admin', 'veterinarian'), checkupController.createCheckup);

// Update and delete operations: restricted to admin only
router.put('/:id', authorize('admin'), checkupController.updateCheckup);
router.delete('/:id', authorize('admin'), checkupController.deleteCheckup);

module.exports = router;
