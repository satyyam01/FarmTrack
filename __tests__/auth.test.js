const request = require('supertest');
const app = require('../app');
const { Sequelize } = require('sequelize');
const db = require('../models');
const User = db.User;
const sequelize = db.sequelize;

// Set test timeout
jest.setTimeout(10000);

describe('Auth API', () => {
  beforeAll(async () => {
    // Initialize test database with verbose logging
    console.log('Syncing test database...');
    try {
      await sequelize.sync({ force: true });
      console.log('Database sync complete');
      // Verify users table exists
      const tables = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table'");
      console.log('Database tables:', tables[0]);
    } catch (error) {
      console.error('Database sync failed:', error);
      throw error;
    }
  });

  afterAll(async () => {
    // Close database connection
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clear users table between tests
    try {
      await sequelize.query('DELETE FROM users');
    } catch (error) {
      console.error('Error clearing users table:', error);
    }
  });

  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User'
  };

  describe('POST /api/auth/register', () => {
    test('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', testUser.email);
      expect(response.body.user).toHaveProperty('firstName', testUser.firstName);
      expect(response.body.user).toHaveProperty('lastName', testUser.lastName);
      expect(response.body.user).not.toHaveProperty('password');
    });

    test('should not register user with existing email', async () => {
      // First create a user
      await User.create(testUser);

      // Try to create another user with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user before each login test
      await request(app)
        .post('/api/auth/register')
        .send(testUser);
    });

    test('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', testUser.email);
    });

    test('should not login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/auth/profile', () => {
    let token;

    beforeEach(async () => {
      // Register and login to get token
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      token = registerResponse.body.token;
    });

    test('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('email', testUser.email);
      expect(response.body).toHaveProperty('firstName', testUser.firstName);
      expect(response.body).toHaveProperty('lastName', testUser.lastName);
    });

    test('should not get profile without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile');

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    test('should not get profile with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalidtoken');

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 