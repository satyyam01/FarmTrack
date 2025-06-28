const mongoose = require('mongoose');
require('dotenv').config();

async function checkServerDB() {
  try {
    console.log('Environment variables:');
    console.log('MONGODB_URI:', process.env.MONGODB_URI);
    console.log('MONGO_URI:', process.env.MONGO_URI);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    // Try to connect using the same logic as the server
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/farmtrack';
    console.log('\nAttempting to connect to:', mongoUri);
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected successfully!');
    console.log('Database name:', mongoose.connection.db.databaseName);
    console.log('Connection host:', mongoose.connection.host);
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('\nCollections in this database:');
    collections.forEach(col => {
      console.log(`- ${col.name}`);
    });
    
    // Check for farms, users, and animals
    for (const collectionName of ['farms', 'users', 'animals']) {
      if (collections.some(c => c.name === collectionName)) {
        const count = await db.collection(collectionName).countDocuments();
        console.log(`\n${collectionName}: ${count} documents`);
        
        if (count > 0) {
          const documents = await db.collection(collectionName).find({}).limit(3).toArray();
          documents.forEach(doc => {
            if (collectionName === 'farms') {
              console.log(`  - ${doc.name} (ID: ${doc._id})`);
            } else if (collectionName === 'users') {
              console.log(`  - ${doc.email} (${doc.name}) - Farm: ${doc.farm_id || 'None'}`);
            } else if (collectionName === 'animals') {
              console.log(`  - ${doc.name} (${doc.tag_number}) - Farm: ${doc.farm_id}`);
            }
          });
        }
      } else {
        console.log(`\n${collectionName}: Collection does not exist`);
      }
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Connection error:', error.message);
  }
}

checkServerDB(); 