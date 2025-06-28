// scripts/test-night-check.js
require('dotenv').config();
const mongoose = require('mongoose');
const { testNightCheck } = require('../scheduler/nightCheckScheduler');

async function testNightCheckFunction() {
  try {
    console.log('🚀 Starting night check test...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Run the night check test
    await testNightCheck();
    
    console.log('🎉 Test completed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the test
testNightCheckFunction(); 