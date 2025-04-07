const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');

// Note routes
router.get('/', noteController.getAllNotes);
router.get('/animal/:animalId', noteController.getNotesByAnimal);
router.post('/', noteController.createNote);
router.put('/:id', noteController.updateNote);
router.delete('/:id', noteController.deleteNote);

module.exports = router;
