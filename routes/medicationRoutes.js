const express = require('express');
const router = express.Router();
const medicationController = require('../controllers/medicationController');

// Medication routes
router.get('/', medicationController.getAllMedications);
router.get('/animal/:animalId', medicationController.getMedicationsByAnimal);
router.post('/', medicationController.createMedication);
router.put('/:id', medicationController.updateMedication);
router.delete('/:id', medicationController.deleteMedication);

module.exports = router;
