const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// Create Sequelize instance
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'database.sqlite'),
  logging: false
});

async function runMigration() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Create return_logs table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS return_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        animal_id INTEGER NOT NULL,
        date DATE NOT NULL,
        returned BOOLEAN NOT NULL DEFAULT 0,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL,
        FOREIGN KEY (animal_id) REFERENCES animals (id) ON DELETE CASCADE ON UPDATE CASCADE,
        UNIQUE(animal_id, date)
      );
    `);
    console.log('Return logs table created successfully.');

    // Create indexes
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_return_logs_animal_id ON return_logs (animal_id);`);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_return_logs_date ON return_logs (date);`);
    console.log('Indexes created successfully.');

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sequelize.close();
  }
}

runMigration(); 