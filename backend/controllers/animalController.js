const Animal = require('../models/animal');
const Yield = require('../models/yield');
const Medication = require('../models/medication');
const Checkup = require('../models/checkup');
const ReturnLog = require('../models/returnLog');
const { getCache, setCache, delCache } = require('../utils/cache');

// GET all animals belonging to the user's farm
exports.getAllAnimals = async (req, res) => {
  try {
    const cacheKey = `page:livestock:${req.user.farm_id}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const animals = await Animal.find({ farm_id: req.user.farm_id })
      .populate('yields')
      .populate('medications')
      .populate('checkups')
      .populate('return_logs');
    await setCache(cacheKey, animals, 60); // 1 min TTL
    res.json(animals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET single animal (only if it belongs to the same farm)
exports.getAnimal = async (req, res) => {
  try {
    const animal = await Animal.findOne({ _id: req.params.id, farm_id: req.user.farm_id })
      .populate('yields')
      .populate('medications')
      .populate('checkups')
      .populate('return_logs');

    if (!animal) return res.status(404).json({ error: 'Animal not found or not in your farm' });
    res.json(animal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST create a new animal in the current user's farm
exports.createAnimal = async (req, res) => {
  try {
    const { yields, medications, checkups, return_logs, ...animalData } = req.body;

    const requiredFields = ['tag_number', 'name', 'type', 'age', 'gender'];
    for (let field of requiredFields) {
      if (!animalData[field]) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }

    if (animalData.age < 0) return res.status(400).json({ error: 'Age must be a positive number' });

    const validTypes = ['Cow', 'Hen', 'Horse', 'Sheep', 'Goat'];
    if (!validTypes.includes(animalData.type)) {
      return res.status(400).json({ error: 'Invalid animal type' });
    }

    if (!['Male', 'Female'].includes(animalData.gender)) {
      return res.status(400).json({ error: 'Invalid gender' });
    }

    const animal = await Animal.create({ ...animalData, farm_id: req.user.farm_id });

    if (yields?.length > 0) {
      await Yield.insertMany(yields.map(y => ({ ...y, animal_id: animal._id, farm_id: req.user.farm_id })));
    }
    if (medications?.length > 0) {
      await Medication.insertMany(medications.map(m => ({ ...m, animal_id: animal._id, farm_id: req.user.farm_id })));
    }
    if (checkups?.length > 0) {
      await Checkup.insertMany(checkups.map(c => ({ ...c, animal_id: animal._id, farm_id: req.user.farm_id })));
    }
    if (return_logs?.length > 0) {
      await ReturnLog.insertMany(return_logs.map(r => ({ ...r, animal_id: animal._id, farm_id: req.user.farm_id })));
    }

    const fullAnimal = await Animal.findById(animal._id)
      .populate('yields')
      .populate('medications')
      .populate('checkups')
      .populate('return_logs');

    // Invalidate livestock cache for this farm
    await delCache(`page:livestock:${req.user.farm_id}`);

    res.status(201).json(fullAnimal);
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.tag_number) {
      return res.status(400).json({ 
        error: `Tag number ${error.keyValue.tag_number} already exists in your farm` 
      });
    }
    
    res.status(500).json({ error: error.message });
  }
};

// PUT update animal (only if it belongs to the user's farm)
exports.updateAnimal = async (req, res) => {
  try {
    const animal = await Animal.findOneAndUpdate(
      { _id: req.params.id, farm_id: req.user.farm_id },
      req.body,
      { new: true }
    );

    if (!animal) return res.status(404).json({ error: 'Animal not found or not in your farm' });
    // Invalidate livestock cache for this farm
    await delCache(`page:livestock:${req.user.farm_id}`);
    res.json(animal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE animal (and related records) if it belongs to the user's farm
exports.deleteAnimal = async (req, res) => {
  try {
    const animal = await Animal.findOne({ _id: req.params.id, farm_id: req.user.farm_id });
    if (!animal) return res.status(404).json({ error: 'Animal not found or not in your farm' });

    await Promise.all([
      Yield.deleteMany({ animal_id: animal._id }),
      Medication.deleteMany({ animal_id: animal._id }),
      Checkup.deleteMany({ animal_id: animal._id }),
      ReturnLog.deleteMany({ animal_id: animal._id }),
      Animal.findByIdAndDelete(animal._id)
    ]);

    // Invalidate livestock cache for this farm
    await delCache(`page:livestock:${req.user.farm_id}`);

    res.json({ message: 'Animal and all related records deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
