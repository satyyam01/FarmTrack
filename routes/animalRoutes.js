const express = require('express');
const router = express.Router();
const animalController = require('../controllers/animalController');
const { authenticate, authorize } = require('../middleware/auth');

// Apply authentication to all routes
router.use(authenticate);

// Publicly readable (for all logged-in users)
router.get('/', animalController.getAllAnimals);
router.get('/:id', animalController.getAnimal);

// Write operations restricted to admin role
router.post('/', authorize('admin'), animalController.createAnimal);
router.put('/:id', authorize('admin'), animalController.updateAnimal);
router.delete('/:id', authorize('admin'), animalController.deleteAnimal);

module.exports = router;
