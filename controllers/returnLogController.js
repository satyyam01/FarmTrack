const ReturnLog = require('../models/returnLog');
const Animal = require('../models/animal');

// Get all return logs for user's farm
exports.getAllReturnLogs = async (req, res) => {
  try {
    const farmId = req.user.farm_id;

    const logs = await ReturnLog.find()
      .populate({
        path: 'animal_id',
        match: { farm_id: farmId },
        select: 'tag_number name type age gender'
      });

    const filteredLogs = logs.filter(log => log.animal_id !== null);
    res.json(filteredLogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get return logs by animal (only from user's farm)
exports.getReturnLogsByAnimal = async (req, res) => {
  try {
    const farmId = req.user.farm_id;

    const animal = await Animal.findOne({ _id: req.params.animalId, farm_id: farmId });
    if (!animal) return res.status(404).json({ error: 'Animal not found or not in your farm' });

    const returnLogs = await ReturnLog.find({ animal_id: animal._id }).populate({
      path: 'animal_id',
      select: 'tag_number name type age gender'
    });

    res.json(returnLogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get return logs with optional date filter (restricted to user's farm)
exports.getReturnLogs = async (req, res) => {
  try {
    const farmId = req.user.farm_id;
    const { date } = req.query;

    let whereClause = {};
    if (date) {
      // Use string date comparison for timezone consistency
      whereClause.date = date;
    }

    const logs = await ReturnLog.find(whereClause).populate({
      path: 'animal_id',
      match: { farm_id: farmId },
      select: 'tag_number name type age gender'
    });

    const filteredLogs = logs.filter(log => log.animal_id !== null);
    res.json(filteredLogs);
  } catch (error) {
    console.error('❌ Error fetching return logs:', error);
    res.status(500).json({ error: 'Failed to fetch return logs' });
  }
};

// Create or update return log (restricted to user's farm)
exports.createReturnLog = async (req, res) => {
  try {
    const { animal_id, date, returned, return_reason } = req.body;
    const farmId = req.user.farm_id;

    if (!animal_id || !date) {
      return res.status(400).json({ error: 'Animal ID and date are required' });
    }

    const animal = await Animal.findOne({ _id: animal_id, farm_id: farmId });
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found or not in your farm' });
    }

    const existingLog = await ReturnLog.findOne({ animal_id, date });

    if (existingLog) {
      existingLog.returned = returned;
      if (return_reason) existingLog.return_reason = return_reason;
      await existingLog.save();
      return res.json(existingLog);
    }

    const newLog = await ReturnLog.create({
      animal_id,
      date,
      returned: returned || false,
      return_reason,
      farm_id: farmId
    });

    const populated = await ReturnLog.findById(newLog._id).populate({
      path: 'animal_id',
      select: 'tag_number name type age gender'
    });

    res.status(201).json(populated);
  } catch (error) {
    console.error('❌ Error creating return log:', error);
    res.status(500).json({ error: 'Failed to create return log' });
  }
};

// Update return log (only if log belongs to user's farm)
exports.updateReturnLog = async (req, res) => {
  try {
    const farmId = req.user.farm_id;
    const updateData = req.body;

    const existingLog = await ReturnLog.findById(req.params.id).populate('animal_id');
    if (!existingLog || !existingLog.animal_id || existingLog.animal_id.farm_id.toString() !== farmId.toString()) {
      return res.status(403).json({ error: 'Unauthorized to update this return log' });
    }

    if (updateData.animal_id) {
      const animal = await Animal.findOne({ _id: updateData.animal_id, farm_id: farmId });
      if (!animal) {
        return res.status(404).json({ error: 'Animal not found or not in your farm' });
      }
    }

    const updated = await ReturnLog.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) {
      return res.status(404).json({ error: 'Return log not found' });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete return log (only if it belongs to user's farm)
exports.deleteReturnLog = async (req, res) => {
  try {
    const farmId = req.user.farm_id;

    const log = await ReturnLog.findById(req.params.id).populate('animal_id');
    if (!log) return res.status(404).json({ error: 'Return log not found' });

    if (!log.animal_id || log.animal_id.farm_id.toString() !== farmId.toString()) {
      return res.status(403).json({ error: 'Unauthorized to delete this return log' });
    }

    await log.deleteOne();
    res.json({ message: 'Return log deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
