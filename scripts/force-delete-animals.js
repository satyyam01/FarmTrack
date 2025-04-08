const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Path to the database file
const dbPath = path.resolve(__dirname, '../database.sqlite');

// Connect to the database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  }
  console.log('Connected to the database');
});

// Disable foreign key constraints
db.run('PRAGMA foreign_keys = OFF;', (err) => {
  if (err) {
    console.error('Error disabling foreign keys:', err);
    process.exit(1);
  }
  console.log('Foreign key constraints disabled');
});

// Function to find animal IDs by tag number
const findAnimalIdsByTagNumber = (tagNumbers) => {
  return new Promise((resolve, reject) => {
    const placeholders = tagNumbers.map(() => '?').join(',');
    db.all(`SELECT id FROM animals WHERE tag_number IN (${placeholders})`, tagNumbers, (err, rows) => {
      if (err) {
        console.error('Error finding animal IDs:', err);
        reject(err);
        return;
      }
      const ids = rows.map(row => row.id);
      console.log(`Found animal IDs: ${ids.join(', ')}`);
      resolve(ids);
    });
  });
};

// Function to delete records from a table by animal_id
const deleteRecordsByAnimalId = (tableName, animalIds) => {
  return new Promise((resolve, reject) => {
    const placeholders = animalIds.map(() => '?').join(',');
    db.run(`DELETE FROM ${tableName} WHERE animal_id IN (${placeholders})`, animalIds, function(err) {
      if (err) {
        console.error(`Error deleting records from ${tableName}:`, err);
        reject(err);
        return;
      }
      console.log(`Deleted ${this.changes} records from ${tableName}`);
      resolve();
    });
  });
};

// Function to delete animals by ID
const deleteAnimalsById = (animalIds) => {
  return new Promise((resolve, reject) => {
    const placeholders = animalIds.map(() => '?').join(',');
    db.run(`DELETE FROM animals WHERE id IN (${placeholders})`, animalIds, function(err) {
      if (err) {
        console.error('Error deleting animals:', err);
        reject(err);
        return;
      }
      console.log(`Deleted ${this.changes} animals`);
      resolve();
    });
  });
};

// Main function to force delete animals and their related records
const forceDeleteAnimals = async () => {
  try {
    // Tag numbers to delete
    const tagNumbers = ['A100', 'A101'];
    
    // Find animal IDs by tag number
    const animalIds = await findAnimalIdsByTagNumber(tagNumbers);
    
    if (animalIds.length === 0) {
      console.log('No animals found with the specified tag numbers');
      db.close();
      return;
    }
    
    // Delete related records from each table
    const tables = ['yields', 'medications', 'checkups', 'notes', 'return_logs'];
    for (const table of tables) {
      await deleteRecordsByAnimalId(table, animalIds);
    }
    
    // Delete the animals
    await deleteAnimalsById(animalIds);
    
    console.log('Force deletion completed successfully');
    
    // Re-enable foreign key constraints
    db.run('PRAGMA foreign_keys = ON;', (err) => {
      if (err) {
        console.error('Error re-enabling foreign keys:', err);
      } else {
        console.log('Foreign key constraints re-enabled');
      }
      db.close();
    });
  } catch (error) {
    console.error('Error during force deletion:', error);
    db.close();
    process.exit(1);
  }
};

// Run the force deletion
forceDeleteAnimals(); 