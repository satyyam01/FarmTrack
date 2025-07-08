// controllers/verificationController.js
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { sendOTP, verifyOTP } = require('../utils/sendgridOTP');
const {
  setPendingUser,
  getPendingUser,
  deletePendingUser,
} = require('../utils/pendingUsersRedis');

// Step 1: Send OTP to Email
exports.sendVerificationOTP = async (req, res) => {
  try {
    const { name, email, password, role, farm_id } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Pro-only multi-role check BEFORE sending OTP
    if (role !== 'admin') {
      const Farm = require('../models/farm');
      const farm = await Farm.findById(farm_id);
      if (!farm) {
        return res.status(400).json({ error: 'Invalid farm ID' });
      }
      if (!farm.isPremium || !farm.premiumExpiry || new Date(farm.premiumExpiry) < Date.now()) {
        return res.status(403).json({ error: 'Multi-role users are only allowed for premium farm, ask your farm owner to upgrade today!' });
      }
    }

    // Store user temporarily in Redis
    await setPendingUser(email, {
      name,
      email,
      password,
      role,
      farm_id,
      timestamp: Date.now()
    });

    // Send OTP using SendGrid
    await sendOTP(email);

    res.status(200).json({ message: 'OTP sent to email. Please verify to complete registration.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
  }
};

// Step 2: Verify OTP & Register User
exports.verifyOTPAndRegister = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const pendingUser = await getPendingUser(email);
    if (!pendingUser) {
      return res.status(404).json({ error: 'No pending registration found for this email' });
    }

    // Verify OTP using SendGrid system
    const isValidOTP = await verifyOTP(email, otp);
    if (!isValidOTP) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Create user in DB
    // Enforce Pro-only registration for non-owner roles
    if (pendingUser.role !== 'admin') {
      const Farm = require('../models/farm');
      const farm = await Farm.findById(pendingUser.farm_id);
      if (!farm) {
        return res.status(400).json({ error: 'Invalid farm ID' });
      }
      if (!farm.isPremium || !farm.premiumExpiry || new Date(farm.premiumExpiry) < Date.now()) {
        return res.status(403).json({ error: 'Only Pro farms can register non-owner roles.' });
      }
    }
    const user = new User({
      name: pendingUser.name,
      email: pendingUser.email,
      password: pendingUser.password,
      role: pendingUser.role,
      farm_id: pendingUser.role !== 'admin' ? pendingUser.farm_id : undefined
    });

    await user.save();
    await deletePendingUser(email); // cleanup

    res.status(201).json({ message: 'User registered successfully. Please login.' });
  } catch (error) {
    res.status(500).json({ error: 'OTP verification failed' });
  }
};
