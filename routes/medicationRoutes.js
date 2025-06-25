const express = require('express');
const router = express.Router();
const medicationController = require('../controllers/medicationController');
const { authenticate, authorize } = require('../middleware/auth');

// Require login for all medication routes
router.use(authenticate);

// Read operations for all logged-in users
router.get('/', medicationController.getAllMedications);
router.get('/animal/:animalId', medicationController.getMedicationsByAnimal);

// Write operations restricted to admins
router.post('/', authorize('admin'), medicationController.createMedication);
router.put('/:id', authorize('admin'), medicationController.updateMedication);
router.delete('/:id', authorize('admin'), medicationController.deleteMedication);

module.exports = router;
