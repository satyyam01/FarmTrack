const express = require('express');
const router = express.Router();
const medicationController = require('../controllers/medicationController');
const { authenticate, authorize } = require('../middleware/auth');

// Require login for all medication routes
router.use(authenticate);

// Read operations: accessible to all logged-in users
router.get('/', medicationController.getAllMedications);
router.get('/animal/:animalId', medicationController.getMedicationsByAnimal);

// Create operations: accessible to admin and veterinarian
router.post('/', authorize('admin', 'veterinarian'), medicationController.createMedication);

// Update operations: accessible to admin and veterinarian
router.put('/:id', authorize('admin', 'veterinarian'), medicationController.updateMedication);

// Delete operations: restricted to admin only
router.delete('/:id', authorize('admin'), medicationController.deleteMedication);

module.exports = router;
