const mongoose = require('mongoose');

async function checkMediwayDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/mediway');
    console.log('Connected to mediway database');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('\nCollections in mediway database:');
    collections.forEach(col => {
      console.log(`- ${col.name}`);
    });
    
    // Check for animals collection
    if (collections.some(col => col.name === 'animals')) {
      const animals = await db.collection('animals').find({}).toArray();
      console.log(`\nAnimals in mediway database: ${animals.length}`);
      
      animals.forEach(animal => {
        console.log(`- ${animal.name} (${animal.tag_number}) - Farm: ${animal.farm_id}`);
      });
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkMediwayDB(); 