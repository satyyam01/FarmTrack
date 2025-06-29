const Setting = require('../models/setting');
const { updateSchedule } = require('../scheduler/nightCheckScheduler');
const pendingEmailChanges = require('../utils/pendingEmailChanges');
const { sendOTP, verifyOTP } = require('../utils/sendgridOTP');
const User = require('../models/user');

// Get all settings for a farm
const getAllSettings = async (req, res) => {
  try {
    const farmId = req.user.farm_id;
    
    // Admin users without farms should be redirected to farm registration
    if (!farmId) {
      if (req.user.role === 'admin') {
        return res.status(403).json({ error: 'Please register your farm first' });
      }
      return res.status(403).json({ error: 'Farm access required' });
    }

    const settings = await Setting.find({ farm_id: farmId });
    const settingsObject = {};
    settings.forEach(setting => {
      settingsObject[setting.key] = setting.value;
    });
    res.json(settingsObject);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

// Get a specific setting for a farm
const getSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const farmId = req.user.farm_id;
    
    // Admin users without farms should be redirected to farm registration
    if (!farmId) {
      if (req.user.role === 'admin') {
        return res.status(403).json({ error: 'Please register your farm first' });
      }
      return res.status(403).json({ error: 'Farm access required' });
    }

    const setting = await Setting.findOne({ key, farm_id: farmId });
    
    if (!setting) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    
    res.json({ key: setting.key, value: setting.value });
  } catch (error) {
    console.error('Error fetching setting:', error);
    res.status(500).json({ error: 'Failed to fetch setting' });
  }
};

// Update a setting for a farm
const updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    const farmId = req.user.farm_id;
    
    // Admin users without farms should be redirected to farm registration
    if (!farmId) {
      if (req.user.role === 'admin') {
        return res.status(403).json({ error: 'Please register your farm first' });
      }
      return res.status(403).json({ error: 'Farm access required' });
    }
    
    if (!value) {
      return res.status(400).json({ error: 'Value is required' });
    }
    
    const setting = await Setting.findOneAndUpdate(
      { key, farm_id: farmId },
      { value },
      { 
        new: true, 
        upsert: true, 
        setDefaultsOnInsert: true,
        default: { description: `Setting for ${key}` }
      }
    );
    
    res.json({ key: setting.key, value: setting.value });
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
};

// Get night check schedule specifically for a farm
const getNightCheckSchedule = async (req, res) => {
  try {
    const farmId = req.user.farm_id;
    
    // Admin users without farms should be redirected to farm registration
    if (!farmId) {
      if (req.user.role === 'admin') {
        return res.status(403).json({ error: 'Please register your farm first' });
      }
      return res.status(403).json({ error: 'Farm access required' });
    }

    const setting = await Setting.findOne({ 
      key: 'night_check_schedule', 
      farm_id: farmId 
    });
    const schedule = setting ? setting.value : '21:00'; // Default to 9 PM
    res.json({ schedule });
  } catch (error) {
    console.error('Error fetching night check schedule:', error);
    res.status(500).json({ error: 'Failed to fetch night check schedule' });
  }
};

// Update night check schedule for a farm
const updateNightCheckSchedule = async (req, res) => {
  try {
    const { schedule } = req.body;
    const farmId = req.user.farm_id;
    
    // Admin users without farms should be redirected to farm registration
    if (!farmId) {
      if (req.user.role === 'admin') {
        return res.status(403).json({ error: 'Please register your farm first' });
      }
      return res.status(403).json({ error: 'Farm access required' });
    }
    
    if (!schedule) {
      return res.status(400).json({ error: 'Schedule time is required' });
    }
    
    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(schedule)) {
      return res.status(400).json({ error: 'Invalid time format. Use HH:MM (24-hour format)' });
    }
    
    const setting = await Setting.findOneAndUpdate(
      { 
        key: 'night_check_schedule', 
        farm_id: farmId 
      },
      { 
        value: schedule, 
        description: 'Daily night return check schedule time (24-hour format)' 
      },
      { 
        new: true, 
        upsert: true, 
        setDefaultsOnInsert: true 
      }
    );
    
    // Update the cron schedule immediately
    await updateSchedule(schedule, farmId);
    
    res.json({ 
      schedule: setting.value,
      message: 'Night check schedule updated successfully and will take effect immediately.'
    });
  } catch (error) {
    console.error('Error updating night check schedule:', error);
    res.status(500).json({ error: 'Failed to update night check schedule' });
  }
};

// Request OTP for email change
const requestEmailChangeOTP = async (req, res) => {
  try {
    const userId = req.user.id;
    const { newEmail } = req.body;
    if (!newEmail) return res.status(400).json({ error: 'New email required' });

    // Check if email is already used
    const existing = await User.findOne({ email: newEmail });
    if (existing) return res.status(400).json({ error: 'Email already in use' });

    // Generate and send OTP
    await sendOTP(newEmail);
    pendingEmailChanges.set(userId, {
      newEmail,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 min expiry
    });
    res.json({ message: 'OTP sent to new email. Please verify.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

// Verify OTP and update email
const verifyEmailChangeOTP = async (req, res) => {
  try {
    const userId = req.user.id;
    const { newEmail, otp } = req.body;
    const pending = pendingEmailChanges.get(userId);
    if (!pending || pending.newEmail !== newEmail) {
      return res.status(400).json({ error: 'No pending email change for this user/email' });
    }
    if (Date.now() > pending.expiresAt) {
      pendingEmailChanges.delete(userId);
      return res.status(400).json({ error: 'OTP expired' });
    }
    // Use verifyOTP from sendgridOTP.js
    const isValid = verifyOTP(newEmail, otp);
    if (!isValid) return res.status(400).json({ error: 'Invalid OTP' });
    // Update email in DB
    await User.findByIdAndUpdate(userId, { email: newEmail });
    pendingEmailChanges.delete(userId);
    res.json({ message: 'Email updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
};

module.exports = {
  getAllSettings,
  getSetting,
  updateSetting,
  getNightCheckSchedule,
  updateNightCheckSchedule,
  requestEmailChangeOTP,
  verifyEmailChangeOTP
}; 