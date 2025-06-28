const mongoose = require('mongoose');

async function fixAnimalIndex() {
  try {
    await mongoose.connect('mongodb://localhost:27017/farmtrack');
    console.log('Connected to database');
    
    const db = mongoose.connection.db;
    
    // First, let's see what indexes exist
    console.log('Checking current indexes...');
    try {
      const indexes = await db.collection('animals').indexes();
      console.log('Current indexes:');
      indexes.forEach((index, i) => {
        console.log(`${i + 1}. Name: ${index.name}`);
        console.log(`   Key:`, index.key);
        console.log(`   Unique: ${index.unique || false}`);
      });
    } catch (error) {
      console.log('No animals collection exists yet, creating it...');
    }
    
    // Drop the old unique index on tag_number if it exists
    try {
      await db.collection('animals').dropIndex('tag_number_1');
      console.log('✅ Dropped old tag_number_1 index');
    } catch (error) {
      console.log('ℹ️  Old tag_number_1 index not found or already dropped');
    }
    
    // Create the new compound unique index
    try {
      await db.collection('animals').createIndex(
        { tag_number: 1, farm_id: 1 }, 
        { unique: true, name: 'tag_number_farm_id_unique' }
      );
      console.log('✅ Created new compound unique index on tag_number and farm_id');
    } catch (error) {
      console.log('ℹ️  Compound index might already exist:', error.message);
    }
    
    // Verify the new indexes
    console.log('\nVerifying new indexes...');
    const newIndexes = await db.collection('animals').indexes();
    console.log('Updated indexes:');
    newIndexes.forEach((index, i) => {
      console.log(`${i + 1}. Name: ${index.name}`);
      console.log(`   Key:`, index.key);
      console.log(`   Unique: ${index.unique || false}`);
    });
    
    await mongoose.connection.close();
    console.log('\n✅ Index fix completed successfully!');
  } catch (error) {
    console.error('❌ Error fixing index:', error);
  }
}

fixAnimalIndex(); 