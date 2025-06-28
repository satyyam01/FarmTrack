const mongoose = require('mongoose');

async function forceFixIndex() {
  try {
    await mongoose.connect('mongodb://localhost:27017/farmtrack');
    console.log('Connected to database');
    
    const db = mongoose.connection.db;
    
    // List all indexes first
    console.log('Current indexes:');
    const indexes = await db.collection('animals').indexes();
    indexes.forEach((index, i) => {
      console.log(`${i + 1}. Name: ${index.name}`);
      console.log(`   Key:`, index.key);
      console.log(`   Unique: ${index.unique || false}`);
    });
    
    // Force drop ALL indexes except _id_ (which is required)
    console.log('\nDropping all indexes except _id_...');
    for (const index of indexes) {
      if (index.name !== '_id_') {
        try {
          await db.collection('animals').dropIndex(index.name);
          console.log(`✅ Dropped index: ${index.name}`);
        } catch (error) {
          console.log(`ℹ️  Could not drop ${index.name}:`, error.message);
        }
      }
    }
    
    // Create the new compound unique index
    console.log('\nCreating new compound unique index...');
    await db.collection('animals').createIndex(
      { tag_number: 1, farm_id: 1 }, 
      { unique: true, name: 'tag_number_farm_id_unique' }
    );
    console.log('✅ Created compound unique index on tag_number and farm_id');
    
    // Verify final indexes
    console.log('\nFinal indexes:');
    const finalIndexes = await db.collection('animals').indexes();
    finalIndexes.forEach((index, i) => {
      console.log(`${i + 1}. Name: ${index.name}`);
      console.log(`   Key:`, index.key);
      console.log(`   Unique: ${index.unique || false}`);
    });
    
    await mongoose.connection.close();
    console.log('\n✅ Force index fix completed!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

forceFixIndex(); 