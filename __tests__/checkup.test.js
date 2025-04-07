const request = require('supertest');
const app = require('../app');
const server = app.listen(0); // Use random available port
const { sequelize, Animal, Checkup } = require('../models');

afterAll(() => server.close());

describe('Checkup API', () => {
  beforeAll(async () => {
    await Animal.sync({ force: true });
    await Checkup.sync({ force: true });
  });

  afterEach(async () => {
    await sequelize.truncate({ cascade: true });
  });

  test('should create a new checkup', async () => {
    const animal = await Animal.create({
      tag_number: 'A100',
      name: 'Bessie',
      type: 'Cow',
      age: 4,
      gender: 'Female'
    });

    const response = await request(server)
      .post('/api/checkups')
      .send({
        animal_id: animal.id,
        date: '2023-01-01',
        vet_name: 'Dr. Smith',
        diagnosis: 'Healthy',
        treatment: 'None'
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
  });

  test('should get checkups by animal', async () => {
    const animal = await Animal.create({
      tag_number: 'A100',
      name: 'Bessie',
      type: 'Cow',
      age: 4,
      gender: 'Female'
    });

    await Checkup.create({
      animal_id: animal.id,
      date: '2023-01-01',
      vet_name: 'Dr. Smith',
      diagnosis: 'Healthy',
      treatment: 'None'
    });

    const response = await request(server)
      .get(`/api/checkups/animal/${animal.id}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
  });

  test('should return 400 for invalid checkup data', async () => {
    const response = await request(server)
      .post('/api/checkups')
      .send({
        date: '2023-01-01',
        vet_name: 'Dr. Smith'
        // Missing required fields
      });
    expect(response.statusCode).toBe(400);
  });

  test('should update a checkup', async () => {
    const animal = await Animal.create({
      tag_number: 'A100',
      name: 'Bessie',
      type: 'Cow',
      age: 4,
      gender: 'Female'
    });

    const checkup = await Checkup.create({
      animal_id: animal.id,
      date: '2023-01-01',
      vet_name: 'Dr. Smith',
      diagnosis: 'Healthy',
      treatment: 'None'
    });

    const response = await request(server)
      .put(`/api/checkups/${checkup.id}`)
      .send({
        diagnosis: 'Slightly ill',
        treatment: 'Antibiotics'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.diagnosis).toBe('Slightly ill');
  });

  test('should delete a checkup', async () => {
    const animal = await Animal.create({
      tag_number: 'A100',
      name: 'Bessie',
      type: 'Cow',
      age: 4,
      gender: 'Female'
    });

    const checkup = await Checkup.create({
      animal_id: animal.id,
      date: '2023-01-01',
      vet_name: 'Dr. Smith',
      diagnosis: 'Healthy',
      treatment: 'None'
    });

    const response = await request(server)
      .delete(`/api/checkups/${checkup.id}`);

    expect(response.statusCode).toBe(204);
  });
});
