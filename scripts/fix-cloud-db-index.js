const mongoose = require('mongoose');
require('dotenv').config();

async function fixCloudDBIndex() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/farmtrack';
    console.log('Connecting to cloud database:', mongoUri);
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to cloud database');
    const db = mongoose.connection.db;
    
    // Check current indexes
    console.log('\nCurrent indexes:');
    const indexes = await db.collection('animals').indexes();
    indexes.forEach((index, i) => {
      console.log(`${i + 1}. Name: ${index.name}`);
      console.log(`   Key:`, index.key);
      console.log(`   Unique: ${index.unique || false}`);
    });
    
    // Drop old unique index if it exists
    try {
      await db.collection('animals').dropIndex('tag_number_1');
      console.log('\n✅ Dropped old tag_number_1 index');
    } catch (error) {
      console.log('\nℹ️  Old tag_number_1 index not found or already dropped');
    }
    
    // Create new compound unique index
    try {
      await db.collection('animals').createIndex(
        { tag_number: 1, farm_id: 1 }, 
        { unique: true, name: 'tag_number_farm_id_unique' }
      );
      console.log('✅ Created new compound unique index on tag_number and farm_id');
    } catch (error) {
      console.log('ℹ️  Compound index might already exist:', error.message);
    }
    
    // Verify final indexes
    console.log('\nFinal indexes:');
    const finalIndexes = await db.collection('animals').indexes();
    finalIndexes.forEach((index, i) => {
      console.log(`${i + 1}. Name: ${index.name}`);
      console.log(`   Key:`, index.key);
      console.log(`   Unique: ${index.unique || false}`);
    });
    
    await mongoose.connection.close();
    console.log('\n✅ Cloud database index fix completed!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixCloudDBIndex(); 