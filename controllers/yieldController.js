const { Yield, Animal } = require('../models');
const { Op } = require('sequelize');
const { startOfDay, endOfDay, startOfWeek, startOfMonth, parseISO } = require('date-fns');

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
    Cow: allAnimals.filter(a => a.type === 'Cow' && a.is_producing_yield).length,
    Goat: allAnimals.filter(a => a.type === 'Goat' && a.is_producing_yield).length,
    Hen: allAnimals.filter(a => a.type === 'Hen' && a.is_producing_yield).length
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
    const { type, startDate, endDate } = req.query;

    // --- Date Filter Setup ---
    const dateWhereClause = {};
    if (startDate) {
        try {
             // Use startOfDay to ensure we capture the whole day
             dateWhereClause.date = { [Op.gte]: startOfDay(parseISO(startDate)) };
        } catch (e) {
            return res.status(400).json({ error: 'Invalid startDate format. Use YYYY-MM-DD.' });
        }
    }
    if (endDate) {
         try {
             // Use endOfDay to ensure we capture the whole day
             const endOfDayDate = endOfDay(parseISO(endDate));
             if (dateWhereClause.date) {
                 dateWhereClause.date[Op.lte] = endOfDayDate;
             } else {
                 dateWhereClause.date = { [Op.lte]: endOfDayDate };
             }
         } catch (e) {
             return res.status(400).json({ error: 'Invalid endDate format. Use YYYY-MM-DD.' });
         }
    }
    // --- End Date Filter Setup ---

    const animalWhereClause = type ? { type } : {};

    // Get all relevant animals first (filtered by type if specified)
    const allAnimals = await Animal.findAll({
      where: animalWhereClause,
      attributes: ['id', 'name', 'tag_number', 'type', 'is_producing_yield']
    });
    const animalIds = allAnimals.map(a => a.id);
    if (animalIds.length === 0) { // Handle case where type filter yields no animals
         return res.json({ 
             daily: calculateStats([], []), 
             weekly: calculateStats([], []), 
             monthly: calculateStats([], []), 
             animals: [] 
         });
    }

    // Base where clause for yields (filter by animal IDs)
    const baseYieldWhere = { 
        animal_id: { [Op.in]: animalIds },
        ...dateWhereClause // Apply date filter here
    };

    // Get all yields matching animal and date filters
    // We fetch ALL relevant yields once, then filter in memory for periods
    const allFilteredYields = await Yield.findAll({
      where: baseYieldWhere,
      include: [{
        model: Animal,
        as: 'animal',
        // No need for type filter here, already filtered by animal_id
      }],
      order: [['date', 'DESC']] // Optional: order results
    });

    // Calculate period start dates (relative to today *if no date filter applied*)
    // If date filters *are* applied, these period calculations are less relevant
    // for the response structure, but we still need the stats structure.
    const todayDate = new Date();
    const todayStart = startOfDay(todayDate);
    const weekStart = startOfWeek(todayDate); 
    const monthStart = startOfMonth(todayDate);

    // Filter in memory for periods IF no date filter was applied
    // OR - If a date filter *was* applied, the periods effectively become the filtered range
    const dailyYields = !startDate && !endDate 
        ? allFilteredYields.filter(y => parseISO(y.date).getTime() >= todayStart.getTime()) 
        : allFilteredYields; // If filtered by date, 'daily' represents the whole filtered set for the table

    const weeklyYields = !startDate && !endDate 
        ? allFilteredYields.filter(y => parseISO(y.date).getTime() >= weekStart.getTime()) 
        : allFilteredYields; // Also represents the full filtered set

    const monthlyYields = !startDate && !endDate 
        ? allFilteredYields.filter(y => parseISO(y.date).getTime() >= monthStart.getTime()) 
        : allFilteredYields; // Also represents the full filtered set

    // Note: If dates are provided, 'weekly' and 'monthly' stats will be the same 
    // as 'daily' because they all operate on the same date-filtered dataset. 
    // The frontend Tabs might need adjustment if true date-range specific stats are needed.
    const response = {
      daily: calculateStats(dailyYields, allAnimals),
      weekly: calculateStats(weeklyYields, allAnimals),
      monthly: calculateStats(monthlyYields, allAnimals),
      animals: allAnimals
    };

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
