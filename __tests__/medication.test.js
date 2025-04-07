const request = require('supertest');
const app = require('../app');
const server = app.listen(0); // Use random available port
const { sequelize, Animal, Medication } = require('../models');

afterAll(() => server.close());

describe('Medication API', () => {
  beforeAll(async () => {
    await Animal.sync({ force: true });
    await Medication.sync({ force: true });
  });

  afterEach(async () => {
    await sequelize.sync({ force: true });
  });

  test('should create a new medication', async () => {
    const animal = await Animal.create({
      tag_number: 'A100',
      name: 'Bessie',
      type: 'Cow',
      age: 4,
      gender: 'Female'
    });

    const response = await request(server)
      .post('/api/medications')
      .send({
        animal_id: animal.id,
        medicine_name: 'Antibiotic',
        dosage: '10ml',
        start_date: '2023-01-01',
        end_date: '2023-01-07',
        frequency: 'Daily'
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
  });

  test('should get medications by animal', async () => {
    const animal = await Animal.create({
      tag_number: 'A100',
      name: 'Bessie',
      type: 'Cow',
      age: 4,
      gender: 'Female'
    });

    await Medication.create({
      animal_id: animal.id,
      medicine_name: 'Antibiotic',
      dosage: '10ml',
      start_date: '2023-01-01'
    });

    const response = await request(server)
      .get(`/api/medications/animal/${animal.id}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
  });

  test('should return 400 for invalid medication data', async () => {
    const response = await request(server)
      .post('/api/medications')
      .send({
        medicine_name: 'Antibiotic',
        // Missing required fields
      });
    expect(response.statusCode).toBe(400);
  });

  test('should update a medication', async () => {
    const animal = await Animal.create({
      tag_number: 'A100',
      name: 'Bessie',
      type: 'Cow',
      age: 4,
      gender: 'Female'
    });

    const medication = await Medication.create({
      animal_id: animal.id,
      medicine_name: 'Antibiotic',
      dosage: '10ml',
      start_date: '2023-01-01'
    });

    const response = await request(server)
      .put(`/api/medications/${medication.id}`)
      .send({
        dosage: '15ml'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.dosage).toBe('15ml');
  });

  test('should delete a medication', async () => {
    const animal = await Animal.create({
      tag_number: 'A100',
      name: 'Bessie',
      type: 'Cow',
      age: 4,
      gender: 'Female'
    });

    const medication = await Medication.create({
      animal_id: animal.id,
      medicine_name: 'Antibiotic',
      dosage: '10ml',
      start_date: '2023-01-01'
    });

    const response = await request(server)
      .delete(`/api/medications/${medication.id}`);

    expect(response.statusCode).toBe(204);
  });
});
