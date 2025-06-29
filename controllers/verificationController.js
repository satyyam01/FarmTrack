// controllers/verificationController.js
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const pendingUsers = require('../utils/pendingUsers');
const { sendOTP, verifyOTP } = require('../utils/sendgridOTP');

const pendingUserTimers = new Map(); // email -> timeout ref

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

    // Store user temporarily in memory
    pendingUsers.set(email, {
      name,
      email,
      password,
      role,
      farm_id,
      timestamp: Date.now()
    });

    // Set a timeout to delete pending user after 10 minutes
    if (pendingUserTimers.has(email)) {
      clearTimeout(pendingUserTimers.get(email));
    }
    const timer = setTimeout(() => {
      pendingUsers.delete(email);
      pendingUserTimers.delete(email);
    }, 10 * 60 * 1000); // 10 minutes
    pendingUserTimers.set(email, timer);

    // Send OTP using SendGrid
    await sendOTP(email);

    res.status(200).json({ message: 'OTP sent to email. Please verify to complete registration.' });
  } catch (error) {
    console.error('Error sending OTP:', error.message);
    res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
  }
};

// Step 2: Verify OTP & Register User
exports.verifyOTPAndRegister = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const pendingUser = pendingUsers.get(email);
    if (!pendingUser) {
      return res.status(404).json({ error: 'No pending registration found for this email' });
    }

    // Verify OTP using SendGrid system
    const isValidOTP = verifyOTP(email, otp);
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
    pendingUsers.delete(email); // cleanup
    if (pendingUserTimers.has(email)) {
      clearTimeout(pendingUserTimers.get(email));
      pendingUserTimers.delete(email);
    }

    res.status(201).json({ message: 'User registered successfully. Please login.' });
  } catch (error) {
    console.error('OTP verification error:', error.message);
    res.status(500).json({ error: 'OTP verification failed' });
  }
};
