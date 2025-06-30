const Checkup = require('../models/checkup');
const Animal = require('../models/animal');

// Get all checkups (only for animals in the user's farm)
exports.getAllCheckups = async (req, res) => {
  try {
    const farmId = req.user.farm_id;

    const checkups = await Checkup.find()
      .populate({
        path: 'animal_id',
        match: { farm_id: farmId }
      });

    const filtered = checkups.filter(c => c.animal_id !== null);
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get checkups by animal (only if animal belongs to user's farm)
exports.getCheckupsByAnimal = async (req, res) => {
  try {
    const farmId = req.user.farm_id;

    const animal = await Animal.findOne({ _id: req.params.animalId, farm_id: farmId });
    if (!animal) return res.status(404).json({ error: 'Animal not found or not in your farm' });

    const checkups = await Checkup.find({ animal_id: animal._id }).populate('animal_id');

    // Optional deduplication (already unique if queried correctly)
    const uniqueCheckups = Array.from(new Map(checkups.map(c => [c._id.toString(), c])).values());

    res.json(uniqueCheckups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new checkup (only for user's farm animals)
exports.createCheckup = async (req, res) => {
  try {
    const { animal_id, date, vet_name, notes, diagnosis } = req.body;
    const farmId = req.user.farm_id;

    if (!animal_id || !date || !vet_name) {
      return res.status(400).json({ error: 'animal_id, date, and vet_name are required' });
    }

    const animal = await Animal.findOne({ _id: animal_id, farm_id: farmId });
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found or not in your farm' });
    }

    const checkup = new Checkup({ animal_id, date, vet_name, notes, diagnosis, farm_id: farmId });
    await checkup.save();

    res.status(201).json(checkup);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update checkup (only if animal is in user's farm)
exports.updateCheckup = async (req, res) => {
  try {
    const farmId = req.user.farm_id;
    const updateData = req.body;

    if (updateData.animal_id) {
      const animal = await Animal.findOne({ _id: updateData.animal_id, farm_id: farmId });
      if (!animal) {
        return res.status(404).json({ error: 'Animal not found or not in your farm' });
      }
    }

    const oldCheckup = await Checkup.findById(req.params.id).populate('animal_id');
    if (!oldCheckup || !oldCheckup.animal_id || oldCheckup.animal_id.farm_id.toString() !== farmId.toString()) {
      return res.status(403).json({ error: 'Unauthorized to update this checkup' });
    }

    const updated = await Checkup.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) {
      return res.status(404).json({ error: 'Checkup not found' });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete checkup (only if animal is in user's farm)
exports.deleteCheckup = async (req, res) => {
  try {
    const farmId = req.user.farm_id;

    const checkup = await Checkup.findById(req.params.id).populate('animal_id');
    if (!checkup) return res.status(404).json({ error: 'Checkup not found' });

    if (!checkup.animal_id || checkup.animal_id.farm_id.toString() !== farmId.toString()) {
      return res.status(403).json({ error: 'Unauthorized to delete this checkup' });
    }

    await checkup.deleteOne();
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
