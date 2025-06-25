const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, {});

const Yield = require('../models/yield');

async function checkYieldDates() {
  try {
    console.log('Checking all yield dates...');
    
    const yields = await Yield.find({});
    console.log(`Found ${yields.length} yields:`);
    
    yields.forEach((yield, index) => {
      console.log(`${index + 1}. ID: ${yield._id}`);
      console.log(`   Date: "${yield.date}"`);
      console.log(`   Type: ${typeof yield.date}`);
      console.log(`   Length: ${yield.date.length}`);
      console.log(`   Animal: ${yield.animal_id}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkYieldDates(); 