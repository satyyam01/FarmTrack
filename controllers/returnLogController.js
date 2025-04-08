const { ReturnLog, Animal } = require('../models');
const { Op } = require('sequelize');

// Get all return logs
exports.getAllReturnLogs = async (req, res) => {
  try {
    const returnLogs = await ReturnLog.findAll({
      include: [{ model: Animal, as: 'animal' }]
    });
    res.json(returnLogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get return logs by animal
exports.getReturnLogsByAnimal = async (req, res) => {
  try {
    const returnLogs = await ReturnLog.findAll({
      where: { animal_id: req.params.animalId },
      include: [{ model: Animal, as: 'animal' }]
    });
    res.json(returnLogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get return logs (with optional date parameter)
exports.getReturnLogs = async (req, res) => {
  try {
    const { date } = req.query;
    
    const whereClause = date ? { date } : {};
    
    const returnLogs = await ReturnLog.findAll({
      where: whereClause,
      include: [{
        model: Animal,
        as: 'animal',
        attributes: ['id', 'tag_number', 'name', 'type', 'age', 'gender']
      }]
    });

    res.json(returnLogs);
  } catch (error) {
    console.error('Error fetching return logs:', error);
    res.status(500).json({ error: 'Failed to fetch return logs' });
  }
};

// Create a new return log
exports.createReturnLog = async (req, res) => {
  try {
    const { animal_id, date, returned } = req.body;

    // Validate required fields
    if (!animal_id || !date) {
      return res.status(400).json({ error: 'Animal ID and date are required' });
    }

    // Check if animal exists
    const animal = await Animal.findByPk(animal_id);
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    // Check if log already exists for this animal and date
    const existingLog = await ReturnLog.findOne({
      where: {
        animal_id,
        date
      }
    });

    if (existingLog) {
      // Update existing log
      existingLog.returned = returned;
      await existingLog.save();
      return res.json(existingLog);
    }

    // Create new log
    const returnLog = await ReturnLog.create({
      animal_id,
      date,
      returned: returned || false
    });

    // Fetch the created log with animal details
    const createdLog = await ReturnLog.findByPk(returnLog.id, {
      include: [{
        model: Animal,
        attributes: ['id', 'tag_number', 'name', 'type', 'age', 'gender']
      }]
    });

    res.status(201).json(createdLog);
  } catch (error) {
    console.error('Error creating return log:', error);
    res.status(500).json({ error: 'Failed to create return log' });
  }
};

// Update return log
exports.updateReturnLog = async (req, res) => {
  try {
    // Normalize field names
    if (req.body.reason) {
      req.body.return_reason = req.body.reason;
      delete req.body.reason;
    }

    // Validate date format if provided
    if (req.body.return_date && !/^\d{4}-\d{2}-\d{2}$/.test(req.body.return_date)) {
      return res.status(400).json({ error: 'return_date must be in YYYY-MM-DD format' });
    }

    // Verify animal exists if animal_id is provided
    if (req.body.animal_id) {
      const animal = await Animal.findByPk(req.body.animal_id);
      if (!animal) {
        return res.status(404).json({ error: 'Animal not found' });
      }
    }

    const [updated] = await ReturnLog.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedReturnLog = await ReturnLog.findByPk(req.params.id);
      // Map return_reason back to reason for backward compatibility
      const response = updatedReturnLog.get({ plain: true });
      if (response.return_reason) {
        response.reason = response.return_reason;
      }
      return res.json(response);
    }
    throw new Error('Return log not found');
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete return log
exports.deleteReturnLog = async (req, res) => {
  try {
    const deleted = await ReturnLog.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      return res.json({ message: 'Return log deleted' });
    }
    throw new Error('Return log not found');
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
