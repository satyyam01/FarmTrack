const { Yield, Animal } = require('../models');
const { Op } = require('sequelize');

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
    if (!req.body.animal_id || !req.body.quantity || !req.body.unit_type || !req.body.date) {
      return res.status(400).json({ error: 'animal_id, quantity, unit_type, and date are required' });
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
    const validUnits = ['milk', 'egg'];
    if (!validUnits.includes(req.body.unit_type)) {
      return res.status(400).json({ error: 'unit_type must be one of: milk, egg' });
    }

    // Verify animal exists
    const animal = await Animal.findByPk(req.body.animal_id);
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    const yieldRecord = await Yield.create(req.body);
    const yieldWithAnimal = await Yield.findByPk(yieldRecord.id, {
      include: [{ model: Animal, as: 'animal' }]
    });
    res.status(201).json(yieldWithAnimal);
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
      const validUnits = ['milk', 'egg'];
      if (!validUnits.includes(req.body.unit_type)) {
        return res.status(400).json({ error: 'unit_type must be one of: milk, egg' });
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

// Helper function to calculate stats
const calculateStats = (yields, allAnimals) => {
  const total = yields.reduce((sum, yield) => sum + Number(yield.quantity), 0);
  const animalsByType = {
    Cow: allAnimals.filter(a => a.type === 'Cow' && a.last_pregnancy).length,
    Goat: allAnimals.filter(a => a.type === 'Goat' && a.last_pregnancy).length,
    Hen: allAnimals.filter(a => a.type === 'Hen' && a.last_pregnancy).length
  };
  
  return { 
    total, 
    yields,
    animalsByType
  };
};

// Get yield overview
exports.getOverview = async (req, res) => {
  try {
    const { type } = req.query;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get all animals first
    const allAnimals = await Animal.findAll({
      where: type ? { type } : {},
      attributes: ['id', 'name', 'tag_number', 'type', 'last_pregnancy']
    });

    // Get all yields with their associated animals
    const allYields = await Yield.findAll({
      include: [{
        model: Animal,
        as: 'animal',
        where: type ? { type } : undefined
      }]
    });

    // Calculate period yields
    const dailyYields = allYields.filter(yield => {
      const yieldDate = new Date(yield.date);
      return yieldDate.getTime() >= today.getTime();
    });

    const weeklyYields = allYields.filter(yield => {
      const yieldDate = new Date(yield.date);
      return yieldDate.getTime() >= startOfWeek.getTime();
    });

    const monthlyYields = allYields.filter(yield => {
      const yieldDate = new Date(yield.date);
      return yieldDate.getTime() >= startOfMonth.getTime();
    });

    const response = {
      daily: calculateStats(dailyYields, allAnimals),
      weekly: calculateStats(weeklyYields, allAnimals),
      monthly: calculateStats(monthlyYields, allAnimals),
      animals: allAnimals
    };

    console.log('Overview response:', response);
    res.json(response);
  } catch (error) {
    console.error('Error in getOverview:', error);
    res.status(500).json({ error: error.message });
  }
};

// Clear all yields
exports.clearAll = async (req, res) => {
  try {
    await Yield.destroy({
      where: {},
      truncate: true
    });
    return res.json({ message: 'All yields cleared successfully' });
  } catch (error) {
    console.error('Error clearing yields:', error);
    res.status(500).json({ error: error.message });
  }
};
