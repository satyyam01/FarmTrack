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

// Enable foreign key support
db.run('PRAGMA foreign_keys = ON;', (err) => {
  if (err) {
    console.error('Error enabling foreign keys:', err);
    process.exit(1);
  }
  console.log('Foreign key support enabled');
});

// Function to recreate a table with CASCADE delete behavior
const recreateTableWithCascade = (tableName, schema, dataCopySql) => {
  return new Promise((resolve, reject) => {
    // Create a temporary table with the new schema
    db.run(`CREATE TABLE ${tableName}_temp ${schema}`, (err) => {
      if (err) {
        console.error(`Error creating temporary table for ${tableName}:`, err);
        reject(err);
        return;
      }
      console.log(`Created temporary table for ${tableName}`);

      // Copy data from the old table to the new table
      db.run(dataCopySql, (err) => {
        if (err) {
          console.error(`Error copying data for ${tableName}:`, err);
          reject(err);
          return;
        }
        console.log(`Copied data for ${tableName}`);

        // Drop the old table
        db.run(`DROP TABLE ${tableName}`, (err) => {
          if (err) {
            console.error(`Error dropping old table for ${tableName}:`, err);
            reject(err);
            return;
          }
          console.log(`Dropped old table for ${tableName}`);

          // Rename the temporary table to the original name
          db.run(`ALTER TABLE ${tableName}_temp RENAME TO ${tableName}`, (err) => {
            if (err) {
              console.error(`Error renaming table for ${tableName}:`, err);
              reject(err);
              return;
            }
            console.log(`Renamed table for ${tableName}`);
            resolve();
          });
        });
      });
    });
  });
};

// Function to drop a table if it exists
const dropTableIfExists = (tableName) => {
  return new Promise((resolve, reject) => {
    db.run(`DROP TABLE IF EXISTS ${tableName}`, (err) => {
      if (err) {
        console.error(`Error dropping table ${tableName}:`, err);
        reject(err);
        return;
      }
      console.log(`Dropped table ${tableName} if it existed`);
      resolve();
    });
  });
};

// Define the schemas and data copy SQL for each table
const tables = [
  {
    name: 'yields',
    schema: `(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      animal_id INTEGER NOT NULL,
      date DATE NOT NULL,
      quantity DECIMAL(10,2) NOT NULL,
      unit_type VARCHAR(255) NOT NULL,
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL,
      FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE CASCADE
    )`,
    dataCopySql: 'INSERT INTO yields_temp SELECT * FROM yields;'
  },
  {
    name: 'medications',
    schema: `(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      animal_id INTEGER NOT NULL,
      medicine_name VARCHAR(255) NOT NULL,
      dosage VARCHAR(255) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE,
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL,
      FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE CASCADE
    )`,
    dataCopySql: 'INSERT INTO medications_temp SELECT * FROM medications;'
  },
  {
    name: 'checkups',
    schema: `(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      animal_id INTEGER NOT NULL,
      date DATE NOT NULL,
      vet_name VARCHAR(255) NOT NULL,
      notes TEXT,
      diagnosis TEXT,
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL,
      FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE CASCADE
    )`,
    dataCopySql: 'INSERT INTO checkups_temp SELECT * FROM checkups;'
  },
  {
    name: 'notes',
    schema: `(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      animal_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL,
      FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE CASCADE
    )`,
    dataCopySql: 'INSERT INTO notes_temp SELECT * FROM notes;'
  },
  {
    name: 'return_logs',
    schema: `(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      animal_id INTEGER NOT NULL,
      date DATE NOT NULL,
      returned BOOLEAN NOT NULL DEFAULT 0,
      return_reason TEXT,
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL,
      FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE CASCADE
    )`,
    dataCopySql: 'INSERT INTO return_logs_temp SELECT * FROM return_logs;'
  }
];

// Tables to drop (temporary and new tables from previous migration attempts)
const tablesToDrop = [
  'yields_temp',
  'medications_temp',
  'checkups_temp',
  'notes_temp',
  'return_logs_temp',
  'yields_new',
  'medications_new',
  'checkups_new',
  'notes_new',
  'return_logs_new'
];

// Process each table
const cleanupDatabase = async () => {
  try {
    // First, drop all temporary and new tables
    for (const tableName of tablesToDrop) {
      await dropTableIfExists(tableName);
    }

    // Then, recreate each table with CASCADE delete behavior
    for (const table of tables) {
      await recreateTableWithCascade(table.name, table.schema, table.dataCopySql);
    }

    console.log('Database cleanup completed successfully');
    db.close();
  } catch (error) {
    console.error('Error cleaning up database:', error);
    db.close();
    process.exit(1);
  }
};

// Run the cleanup
cleanupDatabase(); 