const mongoose = require('mongoose');

async function checkFarmAnimals() {
  try {
    await mongoose.connect('mongodb://localhost:27017/farmtrack');
    console.log('Connected to database');
    
    const db = mongoose.connection.db;
    
    // Get all animals and their farm associations
    const animals = await db.collection('animals').find({}).toArray();
    
    console.log(`\nTotal animals in database: ${animals.length}`);
    
    // Group by farm_id
    const animalsByFarm = {};
    animals.forEach(animal => {
      const farmId = animal.farm_id.toString();
      if (!animalsByFarm[farmId]) {
        animalsByFarm[farmId] = [];
      }
      animalsByFarm[farmId].push({
        name: animal.name,
        tag_number: animal.tag_number,
        type: animal.type
      });
    });
    
    console.log('\nAnimals by farm:');
    Object.keys(animalsByFarm).forEach(farmId => {
      console.log(`\nFarm ID: ${farmId}`);
      animalsByFarm[farmId].forEach(animal => {
        console.log(`  - ${animal.name} (${animal.tag_number}) - ${animal.type}`);
      });
    });
    
    // Check for any animals with tag A100
    const a100Animals = animals.filter(animal => animal.tag_number === 'A100');
    console.log(`\nAnimals with tag A100: ${a100Animals.length}`);
    a100Animals.forEach(animal => {
      console.log(`  - ${animal.name} in farm ${animal.farm_id}`);
    });
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkFarmAnimals(); 