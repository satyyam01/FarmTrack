const express = require('express');
const router = express.Router();
const yieldController = require('../controllers/yieldController');

// Yield routes
router.get('/', yieldController.getAllYields);
router.get('/animal/:animalId', yieldController.getYieldsByAnimal);
router.post('/', yieldController.createYield);
router.put('/:id', yieldController.updateYield);
router.delete('/:id', yieldController.deleteYield);

module.exports = router;
