module.exports = {
  storage: './database_test.sqlite',
  dialect: 'sqlite',
  logging: false,
  pool: {
    max: 1,
    min: 0,
    idle: 10000,
    acquire: 30000
  }
};
