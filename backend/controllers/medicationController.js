const Medication = require('../models/medication');
const Animal = require('../models/animal');

// Get all medications for the user's farm
exports.getAllMedications = async (req, res) => {
  try {
    const farmId = req.user.farm_id;

    const medications = await Medication.find()
      .populate({
        path: 'animal_id',
        match: { farm_id: farmId }
      });

    // Filter out nulls (animals not in this user's farm)
    const filtered = medications.filter(m => m.animal_id !== null);

    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get medications by animal (must belong to the user's farm)
exports.getMedicationsByAnimal = async (req, res) => {
  try {
    const farmId = req.user.farm_id;
    const animal = await Animal.findOne({ _id: req.params.animalId, farm_id: farmId });

    if (!animal) return res.status(404).json({ error: 'Animal not found or not in your farm' });

    const medications = await Medication.find({ animal_id: animal._id }).populate('animal_id');
    res.json(medications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new medication
exports.createMedication = async (req, res) => {
  try {
    const { animal_id, medicine_name, dosage, start_date, end_date } = req.body;
    const farmId = req.user.farm_id;

    if (!animal_id || !medicine_name || !dosage || !start_date) {
      return res.status(400).json({ error: 'animal_id, medicine_name, dosage, and start_date are required' });
    }

    if (medicine_name.length > 255) {
      return res.status(400).json({ error: 'Medicine name must be 255 characters or less' });
    }

    if (!/^\d+(\.\d+)?\s*[a-zA-Z]*$/.test(dosage)) {
      return res.status(400).json({ error: 'Dosage must be in format "number unit" (e.g., "5 mg")' });
    }

    const animal = await Animal.findOne({ _id: animal_id, farm_id: farmId });
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found or not in your farm' });
    }

    const medication = new Medication({ animal_id, medicine_name, dosage, start_date, end_date, farm_id: farmId });
    await medication.save();

    res.status(201).json(medication);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update medication (only if animal belongs to user's farm)
exports.updateMedication = async (req, res) => {
  try {
    const farmId = req.user.farm_id;
    const updateData = req.body;

    if (updateData.medicine_name && updateData.medicine_name.length > 255) {
      return res.status(400).json({ error: 'Medicine name must be 255 characters or less' });
    }

    if (updateData.dosage && !/^\d+(\.\d+)?\s*[a-zA-Z]*$/.test(updateData.dosage)) {
      return res.status(400).json({ error: 'Dosage must be in format "number unit" (e.g., "5 mg")' });
    }

    if (updateData.animal_id) {
      const animal = await Animal.findOne({ _id: updateData.animal_id, farm_id: farmId });
      if (!animal) {
        return res.status(404).json({ error: 'Animal not found or not in your farm' });
      }
    }

    const oldMedication = await Medication.findById(req.params.id).populate('animal_id');
    if (!oldMedication || !oldMedication.animal_id || oldMedication.animal_id.farm_id.toString() !== farmId.toString()) {
      return res.status(403).json({ error: 'Unauthorized to update this medication' });
    }

    const updated = await Medication.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete medication (only if animal belongs to user's farm)
exports.deleteMedication = async (req, res) => {
  try {
    const farmId = req.user.farm_id;
    const medication = await Medication.findById(req.params.id).populate('animal_id');

    if (!medication) {
      return res.status(404).json({ error: 'Medication not found' });
    }

    if (!medication.animal_id || medication.animal_id.farm_id.toString() !== farmId.toString()) {
      return res.status(403).json({ error: 'Unauthorized to delete this medication' });
    }

    await medication.deleteOne();
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
