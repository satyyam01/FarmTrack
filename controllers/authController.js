const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Farm = require('../models/farm'); // Add this

// JWT generator (same)
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      farm_id: user.farm_id // ✅ This is crucial
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};


// 👇 Modified Register function
exports.register = async (req, res) => {
  try {
    console.log("Registration request received:", { email: req.body.email, role: req.body.role })
    const { email, password, name, role, farm_id } = req.body;

    // Check for duplicate user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("Duplicate user found:", email)
      return res.status(400).json({ error: 'Email already registered' });
    }

    // If role is NOT admin, require valid farm_id
    if (role !== 'admin') {
      if (!farm_id) {
        console.log("Non-admin user missing farm_id")
        return res.status(400).json({ error: 'farm_id is required for non-admin users' });
      }

      const farmExists = await Farm.findById(farm_id);
      if (!farmExists) {
        console.log("Farm not found:", farm_id)
        return res.status(404).json({ error: 'Farm not found' });
      }
    }

    // Create the user
    const user = new User({
      email,
      password,
      name,
      role: role || 'user',
      farm_id: role !== 'admin' ? farm_id : undefined
    });

    await user.save();
    console.log("User created successfully:", { id: user._id, email: user.email, role: user.role })

    // Response without token - user must login separately
    const response = {
      message: 'User registered successfully. Please login to continue.',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        farm_id: user.farm_id || null
      }
    };
    
    console.log("Sending registration response (NO TOKEN):", response)
    res.status(201).json(response);
  } catch (error) {
    console.error("Registration error:", error)
    res.status(400).json({ error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Validate password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user);

    // Return user data and token
    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        farm_id: user.farm_id || null  // ✅ Include this
      },
      token
    });
    
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already in use by another user' });
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate new token with updated user data
    const token = generateToken(updatedUser);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        farm_id: updatedUser.farm_id || null
      },
      token
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete user account with role-based cascading actions
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Import required models for cascading deletes
    const Farm = require('../models/farm');
    const Animal = require('../models/animal');
    const Yield = require('../models/yield');
    const Medication = require('../models/medication');
    const Checkup = require('../models/checkup');
    const ReturnLog = require('../models/returnLog');

    // Role-based cascading deletion logic
    if (user.role === 'admin' && user.farm_id) {
      // Farm owner deletion - most destructive
      console.log(`Deleting farm owner account: ${user.email} (Farm ID: ${user.farm_id})`);
      
      // 1. Delete all animals in the farm
      const animals = await Animal.find({ farm_id: user.farm_id });
      const animalIds = animals.map(animal => animal._id);
      
      // 2. Delete all related data for these animals
      await Yield.deleteMany({ animal_id: { $in: animalIds } });
      await Medication.deleteMany({ animal_id: { $in: animalIds } });
      await Checkup.deleteMany({ animal_id: { $in: animalIds } });
      await ReturnLog.deleteMany({ animal_id: { $in: animalIds } });
      
      // 3. Delete all animals
      await Animal.deleteMany({ farm_id: user.farm_id });
      
      // 4. Delete the farm
      await Farm.findByIdAndDelete(user.farm_id);
      
      // 5. Delete all users associated with this farm
      await User.deleteMany({ farm_id: user.farm_id });
      
      console.log(`Deleted farm ${user.farm_id} and all associated data`);
      
    } else if (user.role === 'admin' && !user.farm_id) {
      // System admin deletion - check if they're the only admin
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ 
          error: 'Cannot delete the last admin account. Please create another admin account first.' 
        });
      }
      
      console.log(`Deleting system admin account: ${user.email}`);
      // Only delete the user account, no cascading for system admins
      
    } else {
      // Regular user deletion (user, veterinarian, farm_worker)
      console.log(`Deleting regular user account: ${user.email} (Role: ${user.role})`);
      
      // For regular users, we only delete their account
      // Any data they created will remain but will show as "Unknown User" or similar
      // This is safer than cascading deletes for regular users
    }

    // Finally, delete the user account
    await User.findByIdAndDelete(userId);
    
    console.log(`Successfully deleted user account: ${user.email}`);
    
    res.json({ 
      message: 'Account deleted successfully',
      deletedUser: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account: ' + error.message });
  }
};
