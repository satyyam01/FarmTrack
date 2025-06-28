const mongoose = require('mongoose');

async function testDuplicateAnimal() {
  try {
    await mongoose.connect('mongodb://localhost:27017/farmtrack');
    console.log('Connected to database');
    
    const db = mongoose.connection.db;
    
    // Test data - same tag number, same farm
    const duplicateAnimal = {
      name: 'Duplicate Cow',
      tag_number: 'A100', // Same tag number
      age: 3,
      gender: 'Male',
      type: 'Cow',
      is_producing_yield: false,
      under_treatment: false,
      farm_id: new mongoose.Types.ObjectId('685f5ae54d6cb24ba7d24bb3'), // Same farm
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('Attempting to add duplicate animal:', duplicateAnimal);
    
    try {
      const result = await db.collection('animals').insertOne(duplicateAnimal);
      console.log('❌ This should have failed! Animal added:', result.insertedId);
    } catch (error) {
      console.log('✅ Correctly prevented duplicate:');
      console.log('Error code:', error.code);
      console.log('Error message:', error.message);
      
      if (error.code === 11000) {
        console.log('This is a duplicate key error');
        console.log('Key pattern:', error.keyPattern);
        console.log('Key value:', error.keyValue);
      }
    }
    
    // Now test adding same tag number to different farm
    const differentFarmAnimal = {
      name: 'Different Farm Cow',
      tag_number: 'A100', // Same tag number
      age: 4,
      gender: 'Female',
      type: 'Cow',
      is_producing_yield: true,
      under_treatment: false,
      farm_id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'), // Different farm ID
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('\nAttempting to add animal with same tag to different farm:', differentFarmAnimal);
    
    try {
      const result = await db.collection('animals').insertOne(differentFarmAnimal);
      console.log('✅ Successfully added animal with same tag to different farm!');
      console.log('Inserted ID:', result.insertedId);
    } catch (error) {
      console.log('❌ Failed to add to different farm:');
      console.log('Error:', error.message);
    }
    
    // Check all animals
    const animals = await db.collection('animals').find({}).toArray();
    console.log(`\nTotal animals in database: ${animals.length}`);
    animals.forEach(animal => {
      console.log(`- ${animal.name} (${animal.tag_number}) - Farm: ${animal.farm_id}`);
    });
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

testDuplicateAnimal(); 