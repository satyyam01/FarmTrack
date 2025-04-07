const { Checkup, Animal } = require('../models');

// Get all checkups
exports.getAllCheckups = async (req, res) => {
  try {
    const checkups = await Checkup.findAll({
      include: [{ model: Animal, as: 'animal' }]
    });
    res.json(checkups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get checkups by animal
exports.getCheckupsByAnimal = async (req, res) => {
  try {
    const checkups = await Checkup.findAll({
      where: { animal_id: req.params.animalId },
      include: [{ model: Animal, as: 'animal' }]
    });
    res.json(checkups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new checkup
exports.createCheckup = async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.animal_id || !req.body.date || !req.body.vet_name) {
      return res.status(400).json({ error: 'animal_id, date, and vet_name are required' });
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(req.body.date)) {
      return res.status(400).json({ error: 'Date must be in YYYY-MM-DD format' });
    }

    // Validate vet_name length
    if (req.body.vet_name.length > 255) {
      return res.status(400).json({ error: 'Vet name must be 255 characters or less' });
    }

    // Validate notes length
    if (req.body.notes && req.body.notes.length > 1000) {
      return res.status(400).json({ error: 'Notes must be 1000 characters or less' });
    }

    // Verify animal exists
    const animal = await Animal.findByPk(req.body.animal_id);
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    const checkup = await Checkup.create(req.body);
    res.status(201).json(checkup);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update checkup
exports.updateCheckup = async (req, res) => {
  try {
    // Validate date format if provided
    if (req.body.date && !/^\d{4}-\d{2}-\d{2}$/.test(req.body.date)) {
      return res.status(400).json({ error: 'Date must be in YYYY-MM-DD format' });
    }

    // Validate vet_name length if provided
    if (req.body.vet_name && req.body.vet_name.length > 255) {
      return res.status(400).json({ error: 'Vet name must be 255 characters or less' });
    }

    // Validate notes length if provided
    if (req.body.notes && req.body.notes.length > 1000) {
      return res.status(400).json({ error: 'Notes must be 1000 characters or less' });
    }

    // Verify animal exists if animal_id is provided
    if (req.body.animal_id) {
      const animal = await Animal.findByPk(req.body.animal_id);
      if (!animal) {
        return res.status(404).json({ error: 'Animal not found' });
      }
    }

    const [updated] = await Checkup.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedCheckup = await Checkup.findByPk(req.params.id);
      return res.status(200).json(updatedCheckup);
    }
    throw new Error('Checkup not found');
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete checkup
exports.deleteCheckup = async (req, res) => {
  try {
    const deleted = await Checkup.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      return res.status(204).end();
    }
    throw new Error('Checkup not found');
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
