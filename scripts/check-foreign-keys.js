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

// Check the current state of foreign key constraints
const checkForeignKeys = () => {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT m.name as table_name, m.sql as table_sql
      FROM sqlite_master m
      WHERE m.type = 'table' AND m.name NOT LIKE 'sqlite_%'
    `, (err, tables) => {
      if (err) {
        console.error('Error querying tables:', err);
        reject(err);
        return;
      }

      console.log('Current table definitions:');
      tables.forEach(table => {
        console.log(`\nTable: ${table.table_name}`);
        console.log(table.table_sql);
      });

      resolve();
    });
  });
};

// Check foreign key pragma
const checkPragma = () => {
  return new Promise((resolve, reject) => {
    db.get('PRAGMA foreign_keys;', (err, result) => {
      if (err) {
        console.error('Error checking foreign_keys pragma:', err);
        reject(err);
        return;
      }
      console.log('\nForeign keys pragma:', result);
      resolve();
    });
  });
};

// Run the checks
const runChecks = async () => {
  try {
    await checkPragma();
    await checkForeignKeys();
    console.log('\nChecks completed successfully');
    db.close();
  } catch (error) {
    console.error('Error running checks:', error);
    db.close();
    process.exit(1);
  }
};

// Run the checks
runChecks(); 