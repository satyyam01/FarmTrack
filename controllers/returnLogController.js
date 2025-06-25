const ReturnLog = require('../models/returnLog');
const Animal = require('../models/animal');

// Get all return logs
exports.getAllReturnLogs = async (req, res) => {
  try {
    const returnLogs = await ReturnLog.find().populate({
      path: 'animal_id',
      select: 'tag_number name type age gender'
    });
    res.json(returnLogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get return logs by animal
exports.getReturnLogsByAnimal = async (req, res) => {
  try {
    const returnLogs = await ReturnLog.find({ animal_id: req.params.animalId }).populate({
      path: 'animal_id',
      select: 'tag_number name type age gender'
    });
    res.json(returnLogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get return logs with optional date filter
exports.getReturnLogs = async (req, res) => {
  try {
    const { date } = req.query;
    console.log("📆 Query Date:", date); // ✅ Debugging log

    const whereClause = date ? { date } : {};

    const returnLogs = await ReturnLog.find(whereClause).populate({
      path: 'animal_id',
      select: 'tag_number name type age gender'
    });

    res.json(returnLogs);
  } catch (error) {
    console.error('❌ Error fetching return logs:', error); // ✅ Detailed logging
    res.status(500).json({ error: 'Failed to fetch return logs' });
  }
};


// Create or update return log for an animal and date
exports.createReturnLog = async (req, res) => {
  try {
    const { animal_id, date, returned, return_reason } = req.body;
    console.log("🐮 Creating return log for:", animal_id); // ✅

    if (!animal_id || !date) {
      return res.status(400).json({ error: 'Animal ID and date are required' });
    }

    const animal = await Animal.findById(animal_id);
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    const existingLog = await ReturnLog.findOne({ animal_id, date });

    if (existingLog) {
      existingLog.returned = returned;
      if (return_reason) existingLog.return_reason = return_reason;
      await existingLog.save();
      return res.json(existingLog);
    }

    const returnLog = await ReturnLog.create({
      animal_id,
      date,
      returned: returned || false,
      return_reason
    });

    const createdLog = await ReturnLog.findById(returnLog._id).populate({
      path: 'animal_id',
      select: 'tag_number name type age gender'
    });

    res.status(201).json(createdLog);
  } catch (error) {
    console.error('❌ Error creating return log:', error); // ✅
    res.status(500).json({ error: 'Failed to create return log' });
  }
};


// Update return log
exports.updateReturnLog = async (req, res) => {
  try {
    const { animal_id } = req.body;

    if (animal_id) {
      const animal = await Animal.findById(animal_id);
      if (!animal) {
        return res.status(404).json({ error: 'Animal not found' });
      }
    }

    const updated = await ReturnLog.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updated) {
      return res.status(404).json({ error: 'Return log not found' });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete return log
exports.deleteReturnLog = async (req, res) => {
  try {
    const deleted = await ReturnLog.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Return log not found' });
    }
    res.json({ message: 'Return log deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
