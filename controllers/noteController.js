const { Note, Animal } = require('../models');

// Get all notes
exports.getAllNotes = async (req, res) => {
  try {
    const notes = await Note.findAll({
      include: [{ model: Animal, as: 'animal' }]
    });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get notes by animal
exports.getNotesByAnimal = async (req, res) => {
  try {
    const notes = await Note.findAll({
      where: { animal_id: req.params.animalId },
      include: [{ model: Animal, as: 'animal' }]
    });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new note
exports.createNote = async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.animal_id || !req.body.content) {
      return res.status(400).json({ error: 'animal_id and content are required' });
    }

    // Validate content length
    if (req.body.content.length > 1000) {
      return res.status(400).json({ error: 'content must be 1000 characters or less' });
    }

    // Verify animal exists
    const animal = await Animal.findByPk(req.body.animal_id);
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    const note = await Note.create(req.body);
    res.status(201).json(note);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update note
exports.updateNote = async (req, res) => {
  try {
    // Validate content length if provided
    if (req.body.content && req.body.content.length > 1000) {
      return res.status(400).json({ error: 'content must be 1000 characters or less' });
    }

    // Verify animal exists if animal_id is provided
    if (req.body.animal_id) {
      const animal = await Animal.findByPk(req.body.animal_id);
      if (!animal) {
        return res.status(404).json({ error: 'Animal not found' });
      }
    }

    const [updated] = await Note.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedNote = await Note.findByPk(req.params.id);
      return res.json(updatedNote);
    }
    throw new Error('Note not found');
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete note
exports.deleteNote = async (req, res) => {
  try {
    const deleted = await Note.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      return res.status(204).end();
    }
    throw new Error('Note not found');
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
