const { Yield, Animal } = require('../models');

// Get all yields
exports.getAllYields = async (req, res) => {
  try {
    const yields = await Yield.findAll({
      include: [{ model: Animal, as: 'animal' }]
    });
    res.json(yields);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get yields by animal
exports.getYieldsByAnimal = async (req, res) => {
  try {
    const yields = await Yield.findAll({
      where: { animal_id: req.params.animalId },
      include: [{ model: Animal, as: 'animal' }]
    });
    res.json(yields);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new yield
exports.createYield = async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.animal_id || !req.body.yield_type || !req.body.quantity || !req.body.unit_type || !req.body.date) {
      return res.status(400).json({ error: 'animal_id, yield_type, quantity, unit_type, and date are required' });
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(req.body.date)) {
      return res.status(400).json({ error: 'date must be in YYYY-MM-DD format' });
    }

    // Validate quantity is positive number
    if (req.body.quantity <= 0) {
      return res.status(400).json({ error: 'quantity must be a positive number' });
    }

    // Validate unit_type
    const validUnits = ['liters', 'kilograms', 'units'];
    if (!validUnits.includes(req.body.unit_type)) {
      return res.status(400).json({ error: 'unit_type must be one of: liters, kilograms, units' });
    }

    // Verify animal exists
    const animal = await Animal.findByPk(req.body.animal_id);
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    const yieldRecord = await Yield.create(req.body);
    res.status(201).json(yieldRecord);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update yield
exports.updateYield = async (req, res) => {
  try {
    // Validate date format if provided
    if (req.body.date && !/^\d{4}-\d{2}-\d{2}$/.test(req.body.date)) {
      return res.status(400).json({ error: 'date must be in YYYY-MM-DD format' });
    }

    // Validate quantity is positive number if provided
    if (req.body.quantity && req.body.quantity <= 0) {
      return res.status(400).json({ error: 'quantity must be a positive number' });
    }

    // Validate unit_type if provided
    if (req.body.unit_type) {
      const validUnits = ['liters', 'kilograms', 'units'];
      if (!validUnits.includes(req.body.unit_type)) {
        return res.status(400).json({ error: 'unit_type must be one of: liters, kilograms, units' });
      }
    }

    // Verify animal exists if animal_id is provided
    if (req.body.animal_id) {
      const animal = await Animal.findByPk(req.body.animal_id);
      if (!animal) {
        return res.status(404).json({ error: 'Animal not found' });
      }
    }

    const [updated] = await Yield.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedYield = await Yield.findByPk(req.params.id);
      return res.json(updatedYield);
    }
    throw new Error('Yield not found');
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete yield
exports.deleteYield = async (req, res) => {
  try {
    const deleted = await Yield.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      return res.json({ message: 'Yield deleted' });
    }
    throw new Error('Yield not found');
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
