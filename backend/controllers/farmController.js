const Farm = require('../models/farm');
const User = require('../models/user');
const Animal = require('../models/animal');
const Yield = require('../models/yield');
const Medication = require('../models/medication');
const Checkup = require('../models/checkup');
const ReturnLog = require('../models/returnLog');
const Notification = require('../models/notification');
const Setting = require('../models/setting');
const jwt = require('jsonwebtoken');

// JWT generator
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      farm_id: user.farm_id
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Create farm (admin only)
exports.createFarm = async (req, res) => {
  try {
    const { name, location } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).json({ error: 'Farm name is required' });
    }

    // Create the farm
    const farm = await Farm.create({
      name,
      location,
      owner: req.user.id // or req.user._id; both should work
    });

    // ✅ Update the admin's farm_id field in the User document
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id, 
      { farm_id: farm._id },
      { new: true }
    ).select('-password');

    // ✅ Generate new token with updated farm_id
    const newToken = generateToken(updatedUser);

    // ✅ Return new token and updated user data
    const response = {
      message: 'Farm created successfully!',
      farm,
      user: updatedUser,
      token: newToken
    };
    
    res.status(201).json(response);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all farms (admin only)
exports.getFarms = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can view farms' });
    }

    const farms = await Farm.find({ owner: req.user.id });
    res.json(farms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get farm by ID (for users who belong to the farm)
exports.getFarmById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user belongs to this farm
    if (req.user.farm_id?.toString() !== id) {
      return res.status(403).json({ error: 'You can only access your own farm information' });
    }

    const farm = await Farm.findById(id);
    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    res.json(farm);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update farm (admin only)
exports.updateFarm = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location } = req.body;

    // Only allow admins to update farms
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update farms' });
    }

    // Check if user owns this farm
    if (req.user.farm_id?.toString() !== id) {
      return res.status(403).json({ error: 'You can only update your own farm' });
    }

    // Validate input
    if (!name) {
      return res.status(400).json({ error: 'Farm name is required' });
    }

    // Update the farm
    const updatedFarm = await Farm.findByIdAndUpdate(
      id,
      { name, location },
      { new: true, runValidators: true }
    );

    if (!updatedFarm) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    // Invalidate dashboard cache for this farm
    const { delCache } = require('../utils/cache');
    await delCache(`page:dashboard:overview:${id}`);

    res.json({
      message: 'Farm updated successfully',
      farm: updatedFarm
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete farm with cascading actions (admin only)
exports.deleteFarm = async (req, res) => {
  try {
    const { id } = req.params;
    const { deleteProfile } = req.body; // Boolean flag to indicate if owner wants to delete profile too

    // Only allow admins to delete farms
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only farm owners can delete farms' });
    }

    // Check if user owns this farm
    if (req.user.farm_id?.toString() !== id) {
      return res.status(403).json({ error: 'You can only delete your own farm' });
    }

    // Verify farm exists
    const farm = await Farm.findById(id);
    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    // 1. Delete all notifications for the farm
    await Notification.deleteMany({ farm_id: id });

    // 2. Delete all settings for the farm
    await Setting.deleteMany({ farm_id: id });

    // 3. Delete all animals in the farm
    const animals = await Animal.find({ farm_id: id });
    
    for (const animal of animals) {
      // Delete all yields for this animal
      await Yield.deleteMany({ animal_id: animal._id });
      
      // Delete all medications for this animal
      await Medication.deleteMany({ animal_id: animal._id });
      
      // Delete all checkups for this animal
      await Checkup.deleteMany({ animal_id: animal._id });
      
      // Delete all return logs for this animal
      await ReturnLog.deleteMany({ animal_id: animal._id });
    }
    
    // Delete all animals
    await Animal.deleteMany({ farm_id: id });

    // 4. Delete any remaining yields, medications, checkups, return logs for the farm
    // (in case there are orphaned records)
    await Yield.deleteMany({ farm_id: id });
    await Medication.deleteMany({ farm_id: id });
    await Checkup.deleteMany({ farm_id: id });
    await ReturnLog.deleteMany({ farm_id: id });

    // 5. Update all users associated with this farm to remove farm_id
    const usersToUpdate = await User.find({ farm_id: id });
    
    await User.updateMany(
      { farm_id: id },
      { $unset: { farm_id: 1 } }
    );

    // 6. Delete the farm
    await Farm.findByIdAndDelete(id);

    // 7. Handle owner profile deletion if requested
    if (deleteProfile) {
      await User.findByIdAndDelete(req.user.id);
      
      res.json({
        message: 'Farm and profile deleted successfully. You will be logged out.',
        deletedFarm: true,
        deletedProfile: true
      });
    } else {
      res.json({
        message: 'Farm deleted successfully. You will be logged out.',
        deletedFarm: true,
        deletedProfile: false
      });
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
