const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Farm = require('../models/farm'); // Add this
const { sendOTP, verifyOTP } = require('../utils/sendgridOTP');

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
    const { email, password, name, role, farm_id } = req.body;

    // Check for duplicate user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long and include at least 1 uppercase letter, 1 digit, and 1 special character.' });
    }

    // If role is NOT admin, require valid farm_id
    if (role !== 'admin') {
      if (!farm_id) {
        return res.status(400).json({ error: 'farm_id is required for non-admin users' });
      }

      const farmExists = await Farm.findById(farm_id);
      if (!farmExists) {
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
    
    res.status(201).json(response);
  } catch (error) {
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

    // Invalidate dashboard cache for this user's farm if applicable
    if (updatedUser.farm_id) {
      const { delCache } = require('../utils/cache');
      await delCache(`page:dashboard:overview:${updatedUser.farm_id}`);
    }

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
    const Notification = require('../models/notification');
    const Setting = require('../models/setting');

    console.log(`Starting account deletion for user: ${user.email} (Role: ${user.role}, Farm ID: ${user.farm_id})`);

    // Role-based cascading deletion logic
    if (user.role === 'admin' && user.farm_id) {
      // 🚨 FARM OWNER DELETION - Most destructive operation
      console.log(`🗑️  Deleting farm owner account: ${user.email} (Farm ID: ${user.farm_id})`);
      
      // 1. Delete all notifications for the farm
      await Notification.deleteMany({ farm_id: user.farm_id });
      console.log(`🗑️  Deleted all notifications for farm ${user.farm_id}`);
      
      // 2. Delete all settings for the farm
      await Setting.deleteMany({ farm_id: user.farm_id });
      console.log(`🗑️  Deleted all settings for farm ${user.farm_id}`);
      
      // 3. Get all animals in the farm for cascading deletes
      const animals = await Animal.find({ farm_id: user.farm_id });
      const animalIds = animals.map(animal => animal._id);
      console.log(`🗑️  Found ${animals.length} animals to delete`);
      
      // 4. Delete all related data for these animals
      await Yield.deleteMany({ animal_id: { $in: animalIds } });
      console.log(`🗑️  Deleted all yields for ${animals.length} animals`);
      
      await Medication.deleteMany({ animal_id: { $in: animalIds } });
      console.log(`🗑️  Deleted all medications for ${animals.length} animals`);
      
      await Checkup.deleteMany({ animal_id: { $in: animalIds } });
      console.log(`🗑️  Deleted all checkups for ${animals.length} animals`);
      
      await ReturnLog.deleteMany({ animal_id: { $in: animalIds } });
      console.log(`🗑️  Deleted all return logs for ${animals.length} animals`);
      
      // 5. Delete all animals
      await Animal.deleteMany({ farm_id: user.farm_id });
      console.log(`🗑️  Deleted ${animals.length} animals`);
      
      // 6. Delete any remaining farm-related records (orphaned data)
      await Yield.deleteMany({ farm_id: user.farm_id });
      await Medication.deleteMany({ farm_id: user.farm_id });
      await Checkup.deleteMany({ farm_id: user.farm_id });
      await ReturnLog.deleteMany({ farm_id: user.farm_id });
      console.log(`🗑️  Deleted any remaining orphaned farm records`);
      
      // 7. Delete the farm
      await Farm.findByIdAndDelete(user.farm_id);
      console.log(`🗑️  Deleted farm ${user.farm_id}`);
      
      // 8. Delete all users associated with this farm
      const farmUsers = await User.find({ farm_id: user.farm_id });
      await User.deleteMany({ farm_id: user.farm_id });
      console.log(`🗑️  Deleted ${farmUsers.length} users associated with farm ${user.farm_id}`);
      
      console.log(`✅ Successfully deleted farm ${user.farm_id} and all associated data`);
      
    } else if (user.role === 'admin' && !user.farm_id) {
      // 🔧 SYSTEM ADMIN DELETION - Check if they're the only admin
      console.log(`🔧 Deleting system admin account: ${user.email}`);
      
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ 
          error: 'Cannot delete the last admin account. Please create another admin account first.' 
        });
      }
      
      // For system admins, only delete their account and notifications
      await Notification.deleteMany({ user_id: userId });
      console.log(`🗑️  Deleted all notifications for system admin ${user.email}`);
      
      console.log(`✅ Successfully deleted system admin account: ${user.email}`);
      
    } else if (user.role === 'veterinarian') {
      // 🩺 VETERINARIAN DELETION - Delete their health records and notifications
      console.log(`🩺 Deleting veterinarian account: ${user.email} (Farm ID: ${user.farm_id})`);
      
      // Delete notifications created by this veterinarian
      await Notification.deleteMany({ user_id: userId });
      console.log(`🗑️  Deleted all notifications for veterinarian ${user.email}`);
      
      // For veterinarians, we keep the health records they created but remove their user association
      // This allows the farm to maintain medical history while removing the user
      console.log(`ℹ️  Health records created by veterinarian ${user.email} will remain but show as "Unknown Veterinarian"`);
      
    } else if (user.role === 'farm_worker') {
      // 👨‍🌾 FARM WORKER DELETION - Delete their activity records and notifications
      console.log(`👨‍🌾 Deleting farm worker account: ${user.email} (Farm ID: ${user.farm_id})`);
      
      // Delete notifications created by this farm worker
      await Notification.deleteMany({ user_id: userId });
      console.log(`🗑️  Deleted all notifications for farm worker ${user.email}`);
      
      // For farm workers, we keep the activity records they created but remove their user association
      // This allows the farm to maintain activity history while removing the user
      console.log(`ℹ️  Activity records created by farm worker ${user.email} will remain but show as "Unknown Worker"`);
      
    } else if (user.role === 'user') {
      // 👤 REGULAR USER DELETION - Delete their notifications only
      console.log(`👤 Deleting regular user account: ${user.email} (Farm ID: ${user.farm_id})`);
      
      // Delete notifications created by this user
      await Notification.deleteMany({ user_id: userId });
      console.log(`🗑️  Deleted all notifications for user ${user.email}`);
      
      // For regular users, we only delete their account and notifications
      // Any data they might have created will remain but show as "Unknown User"
      console.log(`ℹ️  Any data created by user ${user.email} will remain but show as "Unknown User"`);
      
    } else {
      // 🚨 UNKNOWN ROLE - Safe deletion
      console.log(`🚨 Deleting account with unknown role: ${user.email} (Role: ${user.role})`);
      
      // Delete notifications created by this user
      await Notification.deleteMany({ user_id: userId });
      console.log(`🗑️  Deleted all notifications for user ${user.email}`);
    }

    // Finally, delete the user account
    await User.findByIdAndDelete(userId);
    console.log(`✅ Successfully deleted user account: ${user.email}`);
    
    res.json({ 
      message: 'Account deleted successfully',
      deletedUser: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        farm_id: user.farm_id
      },
      cascadingActions: {
        notificationsDeleted: true,
        roleSpecificActions: user.role
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete account: ' + error.message });
  }
};

// Request password change OTP
exports.requestPasswordChangeOTP = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    await sendOTP(user.email);
    res.json({ message: 'OTP sent to your email.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send OTP: ' + error.message });
  }
};

// Change password with OTP
exports.changePasswordWithOTP = async (req, res) => {
  try {
    const userId = req.user.id;
    const { newPassword, otp } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    // Password strength validation
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long and include at least 1 uppercase letter, 1 digit, and 1 special character.' });
    }
    // Verify OTP
    const isValidOtp = verifyOTP(user.email, otp);
    if (!isValidOtp) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }
    // Update password
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to change password: ' + error.message });
  }
};
