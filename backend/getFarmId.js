require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user');
const Farm = require('./models/farm');

const MONGODB_URI = process.env.MONGODB_URI;

async function getFarmInfo() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    // Get all farms
    const farms = await Farm.find({});
    console.log('\n📋 All Farms:');
    farms.forEach(farm => {
      console.log(`Farm ID: ${farm._id} | Name: ${farm.name} | Location: ${farm.location}`);
    });
    
    // Get all users with their farm info
    const users = await User.find({}).populate('farm_id');
    console.log('\n👥 All Users:');
    users.forEach(user => {
      console.log(`User: ${user.name} (${user.email}) | Farm: ${user.farm_id?.name || 'No farm'} | Farm ID: ${user.farm_id?._id || 'N/A'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

getFarmInfo(); 