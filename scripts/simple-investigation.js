const mongoose = require('mongoose');

async function simpleInvestigation() {
  try {
    await mongoose.connect('mongodb://localhost:27017/farmtrack');
    console.log('Connected to database');
    
    const db = mongoose.connection.db;
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('\nCollections in database:');
    collections.forEach(col => {
      console.log(`- ${col.name}`);
    });
    
    // Check each collection
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`\n${collection.name}: ${count} documents`);
      
      if (count > 0) {
        const sample = await db.collection(collection.name).findOne();
        console.log('Sample document:', JSON.stringify(sample, null, 2));
      }
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

simpleInvestigation(); 