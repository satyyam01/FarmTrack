const Farm = require('../models/farm');
const User = require('../models/user');
const Animal = require('../models/animal');
const Yield = require('../models/yield');
const Medication = require('../models/medication');
const Checkup = require('../models/checkup');
const ReturnLog = require('../models/returnLog');

exports.createFarm = async (req, res) => {
  try {
    console.log("Farm creation request received from user:", req.user.id, "role:", req.user.role)
    
    // ✅ Only allow admins to create farms
    if (req.user.role !== 'admin') {
      console.log("Non-admin user attempted to create farm")
      return res.status(403).json({ error: 'Only admins can create farms' });
    }

    const { name, location } = req.body;
    console.log("Creating farm:", { name, location })

    if (!name) {
      return res.status(400).json({ error: 'Farm name is required' });
    }

    // ✅ Create the farm and link it to the admin
    const farm = await Farm.create({
      name,
      location,
      owner: req.user.id // or req.user._id; both should work
    });

    console.log("Farm created:", farm._id)

    // ✅ Update the admin's farm_id field in the User document
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id, 
      { farm_id: farm._id },
      { new: true }
    ).select('-password');

    console.log("User updated with farm_id:", updatedUser.farm_id)

    // ⚠️ Return updated user data and farm info (NO TOKEN)
    const response = {
      message: 'Farm created successfully. Please re-login to get updated farm access.',
      farm,
      user: updatedUser
    };
    
    console.log("Sending farm creation response (NO TOKEN):", response)
    res.status(201).json(response);

  } catch (error) {
    console.error("Farm creation error:", error)
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

    console.log("Farm deletion request received from user:", req.user.id, "role:", req.user.role);
    console.log("Delete profile flag:", deleteProfile);

    // Only allow admins to delete farms
    if (req.user.role !== 'admin') {
      console.log("Non-admin user attempted to delete farm");
      return res.status(403).json({ error: 'Only farm owners can delete farms' });
    }

    // Check if user owns this farm
    if (req.user.farm_id?.toString() !== id) {
      console.log("User attempted to delete farm they don't own");
      return res.status(403).json({ error: 'You can only delete your own farm' });
    }

    // Verify farm exists
    const farm = await Farm.findById(id);
    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    console.log("Starting cascading deletion for farm:", id);

    // 1. Delete all animals in the farm
    const animals = await Animal.find({ farm_id: id });
    console.log(`Found ${animals.length} animals to delete`);
    
    for (const animal of animals) {
      // Delete all yields for this animal
      await Yield.deleteMany({ animal_id: animal._id });
      console.log(`Deleted yields for animal ${animal._id}`);
      
      // Delete all medications for this animal
      await Medication.deleteMany({ animal_id: animal._id });
      console.log(`Deleted medications for animal ${animal._id}`);
      
      // Delete all checkups for this animal
      await Checkup.deleteMany({ animal_id: animal._id });
      console.log(`Deleted checkups for animal ${animal._id}`);
      
      // Delete all return logs for this animal
      await ReturnLog.deleteMany({ animal_id: animal._id });
      console.log(`Deleted return logs for animal ${animal._id}`);
    }
    
    // Delete all animals
    await Animal.deleteMany({ farm_id: id });
    console.log(`Deleted ${animals.length} animals`);

    // 2. Delete any remaining yields, medications, checkups, return logs for the farm
    // (in case there are orphaned records)
    await Yield.deleteMany({ farm_id: id });
    await Medication.deleteMany({ farm_id: id });
    await Checkup.deleteMany({ farm_id: id });
    await ReturnLog.deleteMany({ farm_id: id });
    console.log("Deleted any remaining farm-related records");

    // 3. Update all users associated with this farm to remove farm_id
    const usersToUpdate = await User.find({ farm_id: id });
    console.log(`Found ${usersToUpdate.length} users to update`);
    
    await User.updateMany(
      { farm_id: id },
      { $unset: { farm_id: 1 } }
    );
    console.log("Updated users to remove farm association");

    // 4. Delete the farm
    await Farm.findByIdAndDelete(id);
    console.log("Deleted farm");

    // 5. Handle owner profile deletion if requested
    if (deleteProfile) {
      console.log("Deleting owner profile as requested");
      await User.findByIdAndDelete(req.user.id);
      
      res.json({
        message: 'Farm and profile deleted successfully. You will be logged out.',
        deletedFarm: true,
        deletedProfile: true
      });
    } else {
      console.log("Owner profile not deleted, will be logged out");
      
      res.json({
        message: 'Farm deleted successfully. You will be logged out.',
        deletedFarm: true,
        deletedProfile: false
      });
    }

  } catch (error) {
    console.error("Farm deletion error:", error);
    res.status(500).json({ error: error.message });
  }
};
