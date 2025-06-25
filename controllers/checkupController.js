// controllers/checkupController.js (Mongoose version)
const Checkup = require('../models/checkup');
const Animal = require('../models/animal');

// Get all checkups
exports.getAllCheckups = async (req, res) => {
  try {
    const checkups = await Checkup.find().populate('animal_id');
    res.json(checkups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get checkups by animal
exports.getCheckupsByAnimal = async (req, res) => {
  try {
    const checkups = await Checkup.find({ animal_id: req.params.animalId }).populate('animal_id');
    res.json(checkups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new checkup
exports.createCheckup = async (req, res) => {
  try {
    const { animal_id, date, vet_name, notes, diagnosis } = req.body;

    if (!animal_id || !date || !vet_name) {
      return res.status(400).json({ error: 'animal_id, date, and vet_name are required' });
    }

    const animal = await Animal.findById(animal_id);
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    const checkup = new Checkup({ animal_id, date, vet_name, notes, diagnosis });
    await checkup.save();
    res.status(201).json(checkup);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update checkup
exports.updateCheckup = async (req, res) => {
  try {
    const updateData = req.body;

    if (updateData.animal_id) {
      const animal = await Animal.findById(updateData.animal_id);
      if (!animal) {
        return res.status(404).json({ error: 'Animal not found' });
      }
    }

    const checkup = await Checkup.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!checkup) {
      return res.status(404).json({ error: 'Checkup not found' });
    }

    res.json(checkup);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete checkup
exports.deleteCheckup = async (req, res) => {
  try {
    const checkup = await Checkup.findByIdAndDelete(req.params.id);
    if (!checkup) {
      return res.status(404).json({ error: 'Checkup not found' });
    }
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
