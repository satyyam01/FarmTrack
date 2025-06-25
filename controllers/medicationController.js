// controllers/medicationController.js
const Medication = require('../models/medication');
const Animal = require('../models/animal');

// Get all medications
exports.getAllMedications = async (req, res) => {
  try {
    const medications = await Medication.find().populate('animal_id');
    res.json(medications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get medications by animal
exports.getMedicationsByAnimal = async (req, res) => {
  try {
    const medications = await Medication.find({ animal_id: req.params.animalId }).populate('animal_id');
    res.json(medications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new medication
exports.createMedication = async (req, res) => {
  try {
    const { animal_id, medicine_name, dosage, start_date, end_date } = req.body;

    // Required fields check
    if (!animal_id || !medicine_name || !dosage || !start_date) {
      return res.status(400).json({ error: 'animal_id, medicine_name, dosage, and start_date are required' });
    }

    // Format validations
    if (medicine_name.length > 255) {
      return res.status(400).json({ error: 'Medicine name must be 255 characters or less' });
    }
    if (!/^\d+(\.\d+)?\s*[a-zA-Z]*$/.test(dosage)) {
      return res.status(400).json({ error: 'Dosage must be in format "number unit" (e.g., "5 mg")' });
    }

    // Check animal exists
    const animal = await Animal.findById(animal_id);
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    const medication = new Medication({ animal_id, medicine_name, dosage, start_date, end_date });
    await medication.save();

    res.status(201).json(medication);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update medication
exports.updateMedication = async (req, res) => {
  try {
    const updateData = req.body;

    // Format validations
    if (updateData.medicine_name && updateData.medicine_name.length > 255) {
      return res.status(400).json({ error: 'Medicine name must be 255 characters or less' });
    }
    if (updateData.dosage && !/^\d+(\.\d+)?\s*[a-zA-Z]*$/.test(updateData.dosage)) {
      return res.status(400).json({ error: 'Dosage must be in format "number unit" (e.g., "5 mg")' });
    }

    if (updateData.animal_id) {
      const animal = await Animal.findById(updateData.animal_id);
      if (!animal) {
        return res.status(404).json({ error: 'Animal not found' });
      }
    }

    const medication = await Medication.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!medication) {
      return res.status(404).json({ error: 'Medication not found' });
    }

    res.json(medication);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete medication
exports.deleteMedication = async (req, res) => {
  try {
    const deleted = await Medication.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Medication not found' });
    }
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
