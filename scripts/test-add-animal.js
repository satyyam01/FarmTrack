const mongoose = require('mongoose');

async function testAddAnimal() {
  try {
    await mongoose.connect('mongodb://localhost:27017/farmtrack');
    console.log('Connected to database');
    
    const db = mongoose.connection.db;
    
    // Test data
    const testAnimal = {
      name: 'Test Cow',
      tag_number: 'A100',
      age: 5,
      gender: 'Female',
      type: 'Cow',
      is_producing_yield: false,
      under_treatment: false,
      farm_id: new mongoose.Types.ObjectId('685f5ae54d6cb24ba7d24bb3'), // Your farm ID
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('Attempting to add test animal:', testAnimal);
    
    try {
      const result = await db.collection('animals').insertOne(testAnimal);
      console.log('✅ Animal added successfully!');
      console.log('Inserted ID:', result.insertedId);
    } catch (error) {
      console.log('❌ Failed to add animal:');
      console.log('Error code:', error.code);
      console.log('Error message:', error.message);
      
      if (error.code === 11000) {
        console.log('This is a duplicate key error');
        console.log('Key pattern:', error.keyPattern);
        console.log('Key value:', error.keyValue);
      }
    }
    
    // Check current animals
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

testAddAnimal(); 