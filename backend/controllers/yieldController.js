const Yield = require('../models/yield');
const Animal = require('../models/animal');
const Farm = require('../models/farm');
const { startOfDay, endOfDay, startOfWeek, startOfMonth, parseISO } = require('date-fns');
const { chunkYieldRecord } = require('../utils/chunker');
const axios = require('axios');
const { Pinecone } = require('@pinecone-database/pinecone');
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const PINECONE_INDEX = process.env.PINECONE_INDEX;
const COHERE_API_KEY = process.env.COHERE_API_KEY;
const { getCache, setCache, delCache } = require('../utils/cache');

// Get all yields
exports.getAllYields = async (req, res) => {
  try {
    const farmId = req.user.farm_id;

    const yields = await Yield.find().populate({
      path: 'animal_id',
      match: { farm_id: farmId },
    });

    const filtered = yields.filter(y => y.animal_id !== null);
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Get yields by animal
exports.getYieldsByAnimal = async (req, res) => {
  try {
    const farmId = req.user.farm_id;

    const animal = await Animal.findOne({ _id: req.params.animalId, farm_id: farmId });
    if (!animal) return res.status(404).json({ error: 'Animal not found or not in your farm' });

    const yields = await Yield.find({ animal_id: animal._id }).populate('animal_id');
    res.json(yields);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Create new yield
exports.createYield = async (req, res) => {
  try {
    const { animal_id, quantity, unit_type, date } = req.body;
    const farmId = req.user.farm_id;

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

    const animal = await Animal.findOne({ _id: animal_id, farm_id: farmId });
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found or not in your farm' });
    }

    const newYield = await Yield.create({ animal_id, quantity, unit_type, date, farm_id: farmId });
    const populated = await Yield.findById(newYield._id).populate('animal_id');
    res.status(201).json(populated);

    // Invalidate today's production overview cache
    const today = getTodayString();
    if (date === today) {
      await delCache(`page:production:overview:${farmId}:${today}`);
    }
    // Invalidate dashboard overview cache
    await delCache(`page:dashboard:overview:${farmId}`);

    // Auto-embed and upload to Pinecone for owners only
    if (req.user.role === 'admin') {
      upsertYieldToPinecone(populated);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// Update yield
exports.updateYield = async (req, res) => {
  try {
    const farmId = req.user.farm_id;

    const existingYield = await Yield.findById(req.params.id).populate('animal_id');
    if (!existingYield || !existingYield.animal_id || existingYield.animal_id.farm_id.toString() !== farmId.toString()) {
      return res.status(403).json({ error: 'Unauthorized to update this yield record' });
    }

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
      const animal = await Animal.findOne({ _id: animal_id, farm_id: farmId });
      if (!animal) {
        return res.status(404).json({ error: 'Animal not found or not in your farm' });
      }
    }

    const updated = await Yield.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ error: 'Yield not found' });
    }

    // Populate animal_id for chunking
    const populated = await Yield.findById(updated._id).populate('animal_id');
    res.json(populated);

    // Invalidate today's production overview cache
    const today = getTodayString();
    if ((date && date === today) || (!date && existingYield.date === today)) {
      await delCache(`page:production:overview:${farmId}:${today}`);
    }
    // Invalidate dashboard overview cache
    await delCache(`page:dashboard:overview:${farmId}`);

    // Auto-embed and upload to Pinecone for owners only
    if (req.user.role === 'admin') {
      upsertYieldToPinecone(populated);
    }
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
    // Invalidate today's production overview cache
    const today = getTodayString();
    if (deleted.date === today) {
      await delCache(`page:production:overview:${deleted.farm_id}:${today}`);
    }
    // Invalidate dashboard overview cache
    await delCache(`page:dashboard:overview:${deleted.farm_id}`);
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

const getMonday = (dateStr) => {
  const d = new Date(dateStr);
  const day = d.getDay();
  // Clone date before mutation
  const monday = new Date(d);
  monday.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
  return monday;
};

const getSunday = (dateStr) => {
  const d = new Date(dateStr);
  const day = d.getDay();
  // Clone date before mutation
  const sunday = new Date(d);
  sunday.setDate(d.getDate() - day + 7);
  return sunday;
};

const getFirstOfMonth = (dateStr) => {
  const d = new Date(dateStr);
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

const getLastOfMonth = (dateStr) => {
  const d = new Date(dateStr);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
};

function formatDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Overview
exports.getOverview = async (req, res) => {
  const farmId = req.user.farm_id;
  try {
    const { type, startDate, endDate } = req.query;
    
    const animalQuery = type ? { type } : {};
    const animals = await Animal.find({ ...animalQuery, farm_id: farmId });
    const animalIds = animals.map(a => a._id);

    if (animalIds.length === 0) {
      return res.json({ daily: calculateStats([], []), weekly: calculateStats([], []), monthly: calculateStats([], []), animals: [] });
    }

    let yieldFilter = {
      animal_id: { $in: animalIds }
    };

    // If date range is provided, filter by date strings
    if (startDate && endDate && startDate === endDate) {
      // Cache only for today
      const today = getTodayString();
      if (startDate === today) {
        const cacheKey = `page:production:overview:${farmId}:${today}`;
        const cached = await getCache(cacheKey);
        if (cached) return res.json(cached);
      }
      // Use selected date as reference for week/month
      const refDate = startDate;
      const monday = formatDateString(getMonday(refDate));
      const sunday = formatDateString(getSunday(refDate));
      const firstOfMonth = formatDateString(getFirstOfMonth(refDate));
      const lastOfMonth = formatDateString(getLastOfMonth(refDate));
      // Daily yields: exact match
      const dailyYields = await Yield.find({ ...yieldFilter, date: refDate }).populate('animal_id').sort({ date: -1 });
      // Weekly yields: Monday to Sunday
      const weeklyYields = await Yield.find({
        ...yieldFilter,
        date: { $gte: monday, $lte: sunday }
      }).populate('animal_id').sort({ date: -1 });
      // Monthly yields: first to last of month
      const monthlyYields = await Yield.find({
        ...yieldFilter,
        date: { $gte: firstOfMonth, $lte: lastOfMonth }
      }).populate('animal_id').sort({ date: -1 });
      const result = {
        daily: calculateStats(dailyYields, animals),
        weekly: calculateStats(weeklyYields, animals),
        monthly: calculateStats(monthlyYields, animals),
        animals,
      };
      if (startDate === today) {
        const cacheKey = `page:production:overview:${farmId}:${today}`;
        await setCache(cacheKey, result, 60);
      }
      res.json(result);
      return;
    } else if (startDate || endDate) {
      yieldFilter.date = {};
      if (startDate) yieldFilter.date.$gte = startDate;
      if (endDate) yieldFilter.date.$lte = endDate;
    }
    
    const allYields = await Yield.find(yieldFilter).populate('animal_id').sort({ date: -1 });

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
    const farmId = req.user.farm_id;
    const animals = await Animal.find({ farm_id: farmId });
    const animalIds = animals.map(a => a._id);

    await Yield.deleteMany({ animal_id: { $in: animalIds } });
    res.json({ message: 'All yields from your farm cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

async function getCohereEmbedding(text) {
  try {
    const response = await axios.post(
      'https://api.cohere.ai/v1/embed',
      {
        texts: [text],
        model: 'embed-english-v3.0',
        input_type: 'search_document',
      },
      {
        headers: {
          Authorization: `Bearer ${COHERE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.embeddings[0];
  } catch (error) {
    console.error('❌ Cohere embedding error:', error?.response?.data || error.message);
    return null;
  }
}

async function upsertYieldToPinecone(yieldDoc) {
  if (!yieldDoc || !yieldDoc.animal_id) return;
  // Only upsert for Pro farms
  const farm = await Farm.findById(yieldDoc.farm_id);
  if (!farm || !farm.isPremium || !farm.premiumExpiry || new Date(farm.premiumExpiry) < Date.now()) {
    console.log(`⛔ Skipping Pinecone upsert: Farm ${yieldDoc.farm_id} is not Pro.`);
    return;
  }
  const chunk = chunkYieldRecord(yieldDoc);
  if (!chunk) return;
  const embedding = await getCohereEmbedding(chunk);
  if (!embedding) return;
  const index = pinecone.Index(PINECONE_INDEX);
  const namespace = `farm_${yieldDoc.farm_id}`;
  const vector = {
    id: yieldDoc._id.toString(),
    values: embedding,
    metadata: {
      text: chunk,
      date: yieldDoc.date,
      unit_type: yieldDoc.unit_type,
      quantity: yieldDoc.quantity,
      animal_name: yieldDoc.animal_id.name || '',
      tag_number: yieldDoc.animal_id.tag_number || '',
    },
  };
  try {
    await index.namespace(namespace).upsert([vector]);
    console.log(`✅ Yield ${yieldDoc._id} upserted to Pinecone [${namespace}]`);
  } catch (err) {
    console.error('❌ Pinecone upsert error:', err?.response?.data || err.message);
  }
}
