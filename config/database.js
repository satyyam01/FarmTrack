require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'farmtrack_dev',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false,
    define: {
      timestamps: true,
      underscored: true
    },
    dialectOptions: {
      foreignKeys: true,
      pragma: {
        foreign_keys: 'ON'
      }
    }
  },
  test: {
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'farmtrack_test',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'sqlite',
    storage: './database.test.sqlite',
    logging: false,
    define: {
      timestamps: true,
      underscored: true
    },
    dialectOptions: {
      foreignKeys: true,
      pragma: {
        foreign_keys: 'ON'
      }
    }
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'sqlite',
    storage: './database.prod.sqlite',
    logging: false,
    define: {
      timestamps: true,
      underscored: true
    },
    dialectOptions: {
      foreignKeys: true,
      pragma: {
        foreign_keys: 'ON'
      }
    }
  }
}; 