const request = require('supertest');
const app = require('../app');
const server = app.listen(0); // Use random available port
const { sequelize, Animal, Yield } = require('../models');

afterAll(() => server.close());

describe('Yield API', () => {
  beforeAll(async () => {
    await Animal.sync({ force: true });
    await Yield.sync({ force: true });
  });

  afterEach(async () => {
    await Yield.destroy({ where: {}, truncate: true });
    await Animal.destroy({ where: {}, truncate: true });
  });

  test('should create a new yield', async () => {
    const animal = await Animal.create({
      tag_number: 'A100',
      name: 'Bessie',
      type: 'Cow',
      age: 4,
      gender: 'Female'
    });

    const response = await request(server)
      .post('/api/yields')
      .send({
        animal_id: animal.id,
        date: '2023-01-01',
        quantity: 10,
        unit_type: 'liters',
        yield_type: 'milk'
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
  });

  test('should get yields by animal', async () => {
    const animal = await Animal.create({
      tag_number: 'A100',
      name: 'Bessie',
      type: 'Cow',
      age: 4,
      gender: 'Female'
    });

    await Yield.create({
      animal_id: animal.id,
      date: '2023-01-01',
      quantity: 10,
      unit_type: 'liters'
    });

    const response = await request(server)
      .get(`/api/yields/animal/${animal.id}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
  });

  test('should return 400 for invalid yield data', async () => {
    const response = await request(server)
      .post('/api/yields')
      .send({
        quantity: 10,
        // Missing required fields
      });
    expect(response.statusCode).toBe(400);
  });

  test('should update a yield', async () => {
    const animal = await Animal.create({
      tag_number: 'A100',
      name: 'Bessie',
      type: 'Cow',
      age: 4,
      gender: 'Female'
    });

    const yieldRecord = await Yield.create({
      animal_id: animal.id,
      date: '2023-01-01',
      quantity: 10,
      unit_type: 'liters'
    });

    const response = await request(server)
      .put(`/api/yields/${yieldRecord.id}`)
      .send({
        quantity: 15
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.quantity).toBe(15);
  });

  test('should delete a yield', async () => {
    const animal = await Animal.create({
      tag_number: 'A100',
      name: 'Bessie',
      type: 'Cow',
      age: 4,
      gender: 'Female'
    });

    const yieldRecord = await Yield.create({
      animal_id: animal.id,
      date: '2023-01-01',
      quantity: 10,
      unit_type: 'liters'
    });

    const response = await request(server)
      .delete(`/api/yields/${yieldRecord.id}`);

    expect(response.statusCode).toBe(200);
  });
});
