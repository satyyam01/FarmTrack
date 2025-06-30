const express = require('express');
const router = express.Router();
const animalController = require('../controllers/animalController');
const { authenticate, authorize } = require('../middleware/auth');

// Apply authentication to all routes
router.use(authenticate);

// Read operations: accessible to all logged-in users (admin, veterinarian, farm_worker, user)
router.get('/', animalController.getAllAnimals);
router.get('/:id', animalController.getAnimal);

// Create and delete operations: restricted to admin role only
router.post('/', authorize('admin'), animalController.createAnimal);
router.delete('/:id', authorize('admin'), animalController.deleteAnimal);

// Update operations: accessible to admin and veterinarian (for treatment status)
router.put('/:id', authorize('admin', 'veterinarian'), animalController.updateAnimal);

module.exports = router;
