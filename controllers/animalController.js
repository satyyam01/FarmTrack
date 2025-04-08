const { Animal, Yield, Medication, Checkup, ReturnLog, sequelize } = require('../models');

// Get all animals
exports.getAllAnimals = async (req, res) => {
  try {
    const animals = await Animal.findAll({
      include: [
        { model: Yield, as: 'yields' },
        { model: Medication, as: 'medications' },
        { model: Checkup, as: 'checkups' }
      ]
    });
    res.json(animals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single animal
exports.getAnimal = async (req, res) => {
  try {
    const animal = await Animal.findByPk(req.params.id, {
      include: [
        { model: Yield, as: 'yields' },
        { model: Medication, as: 'medications' },
        { model: Checkup, as: 'checkups' }
      ]
    });
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }
    res.json(animal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new animal
exports.createAnimal = async (req, res) => {
  try {
    const { yields, medications, checkups, ...animalData } = req.body;
    
    // Validate required fields
    if (!animalData.tag_number || !animalData.name || !animalData.type || !animalData.age || !animalData.gender) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    // Validate tag_number length
    if (animalData.tag_number.length > 255) {
      return res.status(400).json({ error: 'Tag number must be 255 characters or less' });
    }

    // Validate age is positive number
    if (animalData.age < 0) {
      return res.status(400).json({ error: 'Age must be a positive number' });
    }

    // Validate type is valid enum value
    const validTypes = ['Cow', 'Hen', 'Horse', 'Sheep', 'Goat'];
    if (!validTypes.includes(animalData.type)) {
      return res.status(400).json({ error: 'Invalid animal type' });
    }

    // Validate gender is valid enum value
    if (!['Male', 'Female'].includes(animalData.gender)) {
      return res.status(400).json({ error: 'Invalid gender' });
    }
    
    const animal = await Animal.create(animalData, {
      include: [
        { model: Yield, as: 'yields' },
        { model: Medication, as: 'medications' },
        { model: Checkup, as: 'checkups' }
      ]
    });

    if (yields && yields.length > 0) {
      await Yield.bulkCreate(yields.map(y => ({ ...y, animal_id: animal.id })));
    }
    if (medications && medications.length > 0) {
      await Medication.bulkCreate(medications.map(m => ({ ...m, animal_id: animal.id })));
    }
    if (checkups && checkups.length > 0) {
      await Checkup.bulkCreate(checkups.map(c => ({ ...c, animal_id: animal.id })));
    }

    const createdAnimal = await Animal.findByPk(animal.id, {
      include: [
        { model: Yield, as: 'yields' },
        { model: Medication, as: 'medications' },
        { model: Checkup, as: 'checkups' }
      ]
    });
    
    res.status(201).json(createdAnimal);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.errors.map(e => e.message) 
      });
    }
    res.status(500).json({ error: error.message });
  }
};

// Update animal
exports.updateAnimal = async (req, res) => {
  try {
    const [updated] = await Animal.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedAnimal = await Animal.findByPk(req.params.id);
      return res.json(updatedAnimal);
    }
    throw new Error('Animal not found');
  } catch (error) {
    if (error.message === 'Animal not found') {
      return res.status(404).json({ error: 'Animal not found' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Delete animal
exports.deleteAnimal = async (req, res) => {
  try {
    // First, find the animal to make sure it exists
    const animal = await Animal.findByPk(req.params.id);
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    // Start a transaction
    const t = await sequelize.transaction();
    
    try {
      // Delete the animal - related records will be deleted automatically due to CASCADE
      await Animal.destroy({
        where: { id: req.params.id },
        transaction: t
      });

      // Commit the transaction
      await t.commit();
      
      return res.json({ message: 'Animal and all related records deleted' });
    } catch (error) {
      // Rollback the transaction if anything fails
      await t.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error deleting animal:', error);
    res.status(400).json({ error: error.message });
  }
};
