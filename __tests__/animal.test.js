const request = require('supertest');
const app = require('../app');
const server = app.listen(0); // Use random available port
const { sequelize, Animal, Yield, Medication, Checkup, Note } = require('../models');

afterAll(() => server.close());

describe('Animal API', () => {
  beforeAll(async () => {
    await Animal.sync({ force: true });
  });

  afterEach(async () => {
    // Clear tables in reverse dependency order
    await Note.destroy({ where: {}, force: true });
    await Checkup.destroy({ where: {}, force: true });
    await Medication.destroy({ where: {}, force: true });
    await Yield.destroy({ where: {}, force: true });
    await Animal.destroy({ where: {}, force: true });
  });

  test('should create animal with related records', async () => {
    const animalData = {
      tag_number: 'A101',
      name: 'Daisy',
      type: 'Cow',
      age: 3,
      gender: 'Female',
      yields: [{
        date: '2023-01-01',
        quantity: 10,
        unit_type: 'liters'
      }],
      medications: [{
        medicine_name: 'Antibiotic',
        dosage: '10ml',
        start_date: '2023-01-01'
      }],
      checkups: [{
        date: '2023-01-01',
        vet_name: 'Dr. Smith'
      }],
      notes: [{
        content: 'Healthy cow'
      }]
    };

    const response = await request(server)
      .post('/api/animals')
      .send(animalData);

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.yields.length).toBe(1);
    expect(response.body.medications.length).toBe(1);
    expect(response.body.checkups.length).toBe(1);
    expect(response.body.notes.length).toBe(1);
  });

  test('should load animal with related records', async () => {
    // Create test data
    const animal = await Animal.create({
      tag_number: 'A102',
      name: 'Molly',
      type: 'Cow',
      age: 5,
      gender: 'Female'
    });

    await Yield.create({
      animal_id: animal.id,
      date: '2023-01-01',
      quantity: 15,
      unit_type: 'liters'
    });

    // Test loading
    const response = await request(server)
      .get(`/api/animals/${animal.id}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.yields.length).toBe(1);
  });

  test('should create a new animal', async () => {
    const response = await request(server)
      .post('/api/animals')
      .send({
        tag_number: 'A100',
        name: 'Bessie',
        type: 'Cow',
        age: 4,
        gender: 'Female'
      });
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
  });

  test('should return 400 for invalid animal data', async () => {
    const response = await request(server)
      .post('/api/animals')
      .send({
        tag_number: '', // Invalid empty tag number
        name: 'Bessie',
        type: 'Cow',
        age: 4,
        gender: 'Female'
      });
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  test('should return 400 for missing required fields', async () => {
    const response = await request(server)
      .post('/api/animals')
      .send({
        name: 'Bessie',
        type: 'Cow',
        age: 4,
        gender: 'Female'
      });
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  test('should return 404 for non-existent animal', async () => {
    const response = await request(server)
      .get('/api/animals/999999');
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('error');
  });

  test('should get all animals', async () => {
    await Animal.create({
      tag_number: 'A100',
      name: 'Bessie',
      type: 'Cow',
      age: 4,
      gender: 'Female'
    });
    
    const response = await request(server)
      .get('/api/animals');
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0]).toHaveProperty('yields');
    expect(response.body[0]).toHaveProperty('medications');
    expect(response.body[0]).toHaveProperty('checkups');
    expect(response.body[0]).toHaveProperty('notes');
  });

  test('should create animal with empty related records', async () => {
    const response = await request(server)
      .post('/api/animals')
      .send({
        tag_number: 'A101',
        name: 'Daisy',
        type: 'Cow',
        age: 3,
        gender: 'Female',
        yields: [],
        medications: [],
        checkups: [],
        notes: []
      });
    expect(response.statusCode).toBe(201);
    expect(response.body.yields.length).toBe(0);
    expect(response.body.medications.length).toBe(0);
    expect(response.body.checkups.length).toBe(0);
    expect(response.body.notes.length).toBe(0);
  });

  test('should reject animal with long tag number', async () => {
    const response = await request(server)
      .post('/api/animals')
      .send({
        tag_number: 'A'.repeat(256), // Exceeds 255 character limit
        name: 'Bessie',
        type: 'Cow',
        age: 4,
        gender: 'Female'
      });
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  test('should handle special characters in name', async () => {
    const response = await request(server)
      .post('/api/animals')
      .send({
        tag_number: 'A102',
        name: 'Béssie-Çow',
        type: 'Cow',
        age: 4,
        gender: 'Female'
      });
    expect(response.statusCode).toBe(201);
    expect(response.body.name).toBe('Béssie-Çow');
  });
});
