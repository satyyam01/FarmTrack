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
