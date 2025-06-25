const Yield = require('../models/yield');
const Animal = require('../models/animal');
const { startOfDay, endOfDay, startOfWeek, startOfMonth, parseISO } = require('date-fns');

// Get all yields
exports.getAllYields = async (req, res) => {
  try {
    const yields = await Yield.find().populate('animal_id');
    res.json(yields);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get yields by animal
exports.getYieldsByAnimal = async (req, res) => {
  try {
    const yields = await Yield.find({ animal_id: req.params.animalId }).populate('animal_id');
    res.json(yields);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new yield
exports.createYield = async (req, res) => {
  try {
    const { animal_id, quantity, unit_type, date } = req.body;

    if (!animal_id || !quantity || !unit_type || !date) {
      return res.status(400).json({ error: 'animal_id, quantity, unit_type, and date are required' });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'date must be in YYYY-MM-DD format' });
    }

    if (quantity <= 0) {
      return res.status(400).json({ error: 'quantity must be a positive number' });
    }

    const validUnits = ['milk', 'egg'];
    if (!validUnits.includes(unit_type)) {
      return res.status(400).json({ error: 'unit_type must be one of: milk, egg' });
    }

    const animal = await Animal.findById(animal_id);
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    const newYield = await Yield.create({ animal_id, quantity, unit_type, date });
    const populatedYield = await Yield.findById(newYield._id).populate('animal_id');

    res.status(201).json(populatedYield);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update yield
exports.updateYield = async (req, res) => {
  try {
    const { date, quantity, unit_type, animal_id } = req.body;

    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'date must be in YYYY-MM-DD format' });
    }

    if (quantity && quantity <= 0) {
      return res.status(400).json({ error: 'quantity must be a positive number' });
    }

    if (unit_type) {
      const validUnits = ['milk', 'egg'];
      if (!validUnits.includes(unit_type)) {
        return res.status(400).json({ error: 'unit_type must be one of: milk, egg' });
      }
    }

    if (animal_id) {
      const animal = await Animal.findById(animal_id);
      if (!animal) {
        return res.status(404).json({ error: 'Animal not found' });
      }
    }

    const updatedYield = await Yield.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedYield) {
      return res.status(404).json({ error: 'Yield not found' });
    }

    res.json(updatedYield);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete yield
exports.deleteYield = async (req, res) => {
  try {
    const deleted = await Yield.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Yield not found' });
    }
    res.json({ message: 'Yield deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Helper to get today's date as YYYY-MM-DD string
function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to get start of week as YYYY-MM-DD string
function getStartOfWeekString() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust when day is Sunday
  const startOfWeek = new Date(now.setDate(diff));
  const year = startOfWeek.getFullYear();
  const month = String(startOfWeek.getMonth() + 1).padStart(2, '0');
  const day = String(startOfWeek.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to get start of month as YYYY-MM-DD string
function getStartOfMonthString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
}

// Helper
const calculateStats = (yields, allAnimals) => {
  const total = yields.reduce((sum, y) => sum + Number(y.quantity), 0);
  const animalsByType = {
    Cow: allAnimals.filter(a => a.type === 'Cow' && a.is_producing_yield).length,
    Goat: allAnimals.filter(a => a.type === 'Goat' && a.is_producing_yield).length,
    Hen: allAnimals.filter(a => a.type === 'Hen' && a.is_producing_yield).length,
  };
  // Map yields to include 'animal' sub-object for frontend compatibility
  const mappedYields = yields.map(y => ({
    id: y._id?.toString?.() || y.id,
    animal_id: y.animal_id?._id?.toString?.() || y.animal_id?.id || y.animal_id,
    // Date is already a string, no conversion needed
    date: y.date,
    quantity: y.quantity,
    unit_type: y.unit_type,
    created_at: y.createdAt,
    updated_at: y.updatedAt,
    animal: y.animal_id && typeof y.animal_id === 'object' ? {
      id: y.animal_id._id?.toString?.() || y.animal_id.id,
      name: y.animal_id.name,
      tag_number: y.animal_id.tag_number,
      type: y.animal_id.type
    } : undefined
  }));
  return { total, yields: mappedYields, animalsByType };
};

// Overview
exports.getOverview = async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;
    
    console.log('=== Backend getOverview Debug ===');
    console.log('Query params:', { type, startDate, endDate });
    console.log('startDate type:', typeof startDate, 'value:', startDate);
    console.log('endDate type:', typeof endDate, 'value:', endDate);

    const animalQuery = type ? { type } : {};
    const animals = await Animal.find(animalQuery);
    const animalIds = animals.map(a => a._id);

    if (animalIds.length === 0) {
      return res.json({ daily: calculateStats([], []), weekly: calculateStats([], []), monthly: calculateStats([], []), animals: [] });
    }

    let yieldFilter = {
      animal_id: { $in: animalIds }
    };

    // If date range is provided, filter by date strings
    if (startDate && endDate && startDate === endDate) {
      // Exact match for single day
      yieldFilter.date = startDate;
      console.log('Using exact date match:', startDate);
    } else if (startDate || endDate) {
      yieldFilter.date = {};
      if (startDate) yieldFilter.date.$gte = startDate;
      if (endDate) yieldFilter.date.$lte = endDate;
      console.log('Using range filter:', yieldFilter.date);
    }
    
    console.log('Final yieldFilter:', JSON.stringify(yieldFilter, null, 2));

    const allYields = await Yield.find(yieldFilter).populate('animal_id').sort({ date: -1 });
    console.log('Found yields:', allYields.length);
    allYields.forEach((y, index) => {
      console.log(`Yield ${index + 1}: date="${y.date}", animal="${y.animal_id?.name}"`);
    });

    // Filter yields based on date strings (no date-fns needed)
    const today = getTodayString();
    const startOfWeek = getStartOfWeekString();
    const startOfMonth = getStartOfMonthString();

    const dailyYields = !startDate && !endDate ? allYields.filter(y => y.date >= today) : allYields;
    const weeklyYields = !startDate && !endDate ? allYields.filter(y => y.date >= startOfWeek) : allYields;
    const monthlyYields = !startDate && !endDate ? allYields.filter(y => y.date >= startOfMonth) : allYields;

    res.json({
      daily: calculateStats(dailyYields, animals),
      weekly: calculateStats(weeklyYields, animals),
      monthly: calculateStats(monthlyYields, animals),
      animals,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Clear all
exports.clearAll = async (req, res) => {
  try {
    await Yield.deleteMany({});
    res.json({ message: 'All yields cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
