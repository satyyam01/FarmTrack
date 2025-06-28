const mongoose = require('mongoose');
const Setting = require('../models/setting');
const Farm = require('../models/farm');
require('dotenv').config();

async function initializeSettings() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Get all farms
    const farms = await Farm.find();
    console.log(`Found ${farms.length} farms`);

    // Initialize settings for each farm
    for (const farm of farms) {
      console.log(`Initializing settings for farm: ${farm.name} (${farm._id})`);
      
      // Check if night check schedule already exists
      const existingSetting = await Setting.findOne({
        key: 'night_check_schedule',
        farm_id: farm._id
      });

      if (!existingSetting) {
        // Create default night check schedule (9 PM)
        await Setting.create({
          key: 'night_check_schedule',
          value: '21:00',
          description: 'Daily night return check schedule time (24-hour format)',
          farm_id: farm._id
        });
        console.log(`✅ Created default night check schedule for farm ${farm.name}`);
      } else {
        console.log(`ℹ️  Night check schedule already exists for farm ${farm.name}`);
      }
    }

    console.log('✅ Settings initialization completed');
  } catch (error) {
    console.error('❌ Error initializing settings:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the initialization
initializeSettings(); 