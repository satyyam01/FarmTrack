const express = require('express');
const router = express.Router();
const animalController = require('../controllers/animalController');

// Animal routes
router.get('/', animalController.getAllAnimals);
router.get('/:id', animalController.getAnimal);
router.post('/', animalController.createAnimal);
router.put('/:id', animalController.updateAnimal);
router.delete('/:id', animalController.deleteAnimal);

module.exports = router;
