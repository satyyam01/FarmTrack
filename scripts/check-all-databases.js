const mongoose = require('mongoose');

async function checkAllDatabases() {
  try {
    // Connect to admin database to list all databases
    await mongoose.connect('mongodb://localhost:27017/admin');
    const adminDb = mongoose.connection.db.admin();
    const dbList = await adminDb.listDatabases();
    
    console.log('All databases:');
    dbList.databases.forEach(db => {
      console.log(`- ${db.name} (${db.sizeOnDisk} bytes)`);
    });
    
    await mongoose.connection.close();
    
    // Check each database for farms and users
    for (const dbInfo of dbList.databases) {
      if (dbInfo.name !== 'admin' && dbInfo.name !== 'local' && dbInfo.name !== 'config') {
        console.log(`\n=== Checking database: ${dbInfo.name} ===`);
        
        try {
          await mongoose.connect(`mongodb://localhost:27017/${dbInfo.name}`);
          const db = mongoose.connection.db;
          
          const collections = await db.listCollections().toArray();
          console.log('Collections:', collections.map(c => c.name).join(', '));
          
          // Check for farms
          if (collections.some(c => c.name === 'farms')) {
            const farmCount = await db.collection('farms').countDocuments();
            console.log(`Farms: ${farmCount} documents`);
            if (farmCount > 0) {
              const farms = await db.collection('farms').find({}).toArray();
              farms.forEach(farm => {
                console.log(`  - ${farm.name} (ID: ${farm._id})`);
              });
            }
          }
          
          // Check for users
          if (collections.some(c => c.name === 'users')) {
            const userCount = await db.collection('users').countDocuments();
            console.log(`Users: ${userCount} documents`);
            if (userCount > 0) {
              const users = await db.collection('users').find({}).toArray();
              users.forEach(user => {
                console.log(`  - ${user.email} (${user.name}) - Farm: ${user.farm_id || 'None'}`);
              });
            }
          }
          
          // Check for animals
          if (collections.some(c => c.name === 'animals')) {
            const animalCount = await db.collection('animals').countDocuments();
            console.log(`Animals: ${animalCount} documents`);
            if (animalCount > 0) {
              const animals = await db.collection('animals').find({}).toArray();
              animals.forEach(animal => {
                console.log(`  - ${animal.name} (${animal.tag_number}) - Farm: ${animal.farm_id}`);
              });
            }
          }
          
          await mongoose.connection.close();
        } catch (error) {
          console.log(`Error checking ${dbInfo.name}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAllDatabases(); 