const { ReturnLog, Animal } = require('../models');

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

// Create new return log
exports.createReturnLog = async (req, res) => {
  try {
    // Validate required fields for creation
    if (!req.body.animal_id || !req.body.return_date || !req.body.return_reason) {
      return res.status(400).json({ error: 'animal_id, return_date, and return_reason are required' });
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(req.body.return_date)) {
      return res.status(400).json({ error: 'return_date must be in YYYY-MM-DD format' });
    }

    // Verify animal exists
    const animal = await Animal.findByPk(req.body.animal_id);
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    const returnLog = await ReturnLog.create(req.body);
    res.status(201).json(returnLog);
  } catch (error) {
    res.status(400).json({ error: error.message });
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
