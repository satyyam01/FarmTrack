const mongoose = require('mongoose');

async function checkDatabases() {
  try {
    await mongoose.connect('mongodb://localhost:27017/farmtrack');
    console.log('Connected to farmtrack database');
    
    const adminDb = mongoose.connection.db.admin();
    
    // List all databases
    const dbList = await adminDb.listDatabases();
    console.log('\nAll databases:');
    dbList.databases.forEach(db => {
      console.log(`- ${db.name} (${db.sizeOnDisk} bytes)`);
    });
    
    // Check current database collections
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('\nCollections in farmtrack database:');
    collections.forEach(col => {
      console.log(`- ${col.name}`);
    });
    
    // Check if there are animals in any collection
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`  ${collection.name}: ${count} documents`);
      
      if (count > 0 && collection.name.includes('animal')) {
        const sample = await db.collection(collection.name).findOne();
        console.log(`    Sample:`, sample);
      }
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkDatabases(); 