const { Medication, Animal } = require('../models');

// Get all medications
exports.getAllMedications = async (req, res) => {
  try {
    const medications = await Medication.findAll({
      include: [{ model: Animal, as: 'animal' }]
    });
    res.json(medications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get medications by animal
exports.getMedicationsByAnimal = async (req, res) => {
  try {
    const medications = await Medication.findAll({
      where: { animal_id: req.params.animalId },
      include: [{ model: Animal, as: 'animal' }]
    });
    res.json(medications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new medication
exports.createMedication = async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.animal_id || !req.body.medicine_name || !req.body.dosage || !req.body.start_date) {
      return res.status(400).json({ error: 'animal_id, medicine_name, dosage, and start_date are required' });
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(req.body.start_date)) {
      return res.status(400).json({ error: 'start_date must be in YYYY-MM-DD format' });
    }

    // Validate medicine_name length
    if (req.body.medicine_name.length > 255) {
      return res.status(400).json({ error: 'Medicine name must be 255 characters or less' });
    }

    // Validate dosage format
    if (!/^\d+(\.\d+)?\s*[a-zA-Z]*$/.test(req.body.dosage)) {
      return res.status(400).json({ error: 'Dosage must be in format "number unit" (e.g., "5 mg")' });
    }

    // Verify animal exists
    const animal = await Animal.findByPk(req.body.animal_id);
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    const medication = await Medication.create(req.body);
    res.status(201).json(medication);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update medication
exports.updateMedication = async (req, res) => {
  try {
    // Validate date format if provided
    if (req.body.start_date && !/^\d{4}-\d{2}-\d{2}$/.test(req.body.start_date)) {
      return res.status(400).json({ error: 'start_date must be in YYYY-MM-DD format' });
    }

    // Validate medicine_name length if provided
    if (req.body.medicine_name && req.body.medicine_name.length > 255) {
      return res.status(400).json({ error: 'Medicine name must be 255 characters or less' });
    }

    // Validate dosage format if provided
    if (req.body.dosage && !/^\d+(\.\d+)?\s*[a-zA-Z]*$/.test(req.body.dosage)) {
      return res.status(400).json({ error: 'Dosage must be in format "number unit" (e.g., "5 mg")' });
    }

    // Verify animal exists if animal_id is provided
    if (req.body.animal_id) {
      const animal = await Animal.findByPk(req.body.animal_id);
      if (!animal) {
        return res.status(404).json({ error: 'Animal not found' });
      }
    }

    const [updated] = await Medication.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedMedication = await Medication.findByPk(req.params.id);
      return res.json(updatedMedication);
    }
    throw new Error('Medication not found');
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete medication
exports.deleteMedication = async (req, res) => {
  try {
    const deleted = await Medication.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      return res.status(204).end();
    }
    throw new Error('Medication not found');
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
