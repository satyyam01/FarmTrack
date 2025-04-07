const express = require('express');
const router = express.Router();
const checkupController = require('../controllers/checkupController');

// Checkup routes
router.get('/', checkupController.getAllCheckups);
router.get('/animal/:animalId', checkupController.getCheckupsByAnimal);
router.post('/', checkupController.createCheckup);
router.put('/:id', checkupController.updateCheckup);
router.delete('/:id', checkupController.deleteCheckup);

module.exports = router;
