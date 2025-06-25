const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Yield = require('../models/yield');

async function migrateYieldDates() {
  try {
    console.log('Starting yield date migration...');
    console.log('Connected to MongoDB:', process.env.MONGODB_URI);
    
    // Find all yields with Date objects
    const yields = await Yield.find({});
    console.log(`Found ${yields.length} yields to migrate`);
    
    if (yields.length === 0) {
      console.log('No yields found in database. Migration not needed.');
      return;
    }
    
    let migratedCount = 0;
    
    for (const yield of yields) {
      console.log(`Processing yield ${yield._id}:`);
      console.log(`  Current date value:`, yield.date);
      console.log(`  Date type:`, typeof yield.date);
      console.log(`  Is Date object:`, yield.date instanceof Date);
      
      // Check if date is a Date object (not already a string)
      if (yield.date instanceof Date) {
        // Convert Date to YYYY-MM-DD string
        const year = yield.date.getFullYear();
        const month = String(yield.date.getMonth() + 1).padStart(2, '0');
        const day = String(yield.date.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        
        // Update the yield with string date
        await Yield.findByIdAndUpdate(yield._id, { date: dateString });
        migratedCount++;
        
        console.log(`  Migrated: ${yield.date.toISOString()} -> ${dateString}`);
      } else {
        console.log(`  Already string date: ${yield.date}`);
      }
    }
    
    console.log(`Migration completed! Migrated ${migratedCount} yields.`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

// Run migration
migrateYieldDates(); 