const request = require('supertest');
const app = require('../app');
const server = app.listen(0); // Use random available port
const { sequelize, Animal, ReturnLog } = require('../models');

afterAll(() => server.close());

describe('ReturnLog API', () => {
  beforeAll(async () => {
    await Animal.sync({ force: true });
    await ReturnLog.sync({ force: true });
  });

  afterEach(async () => {
    await sequelize.truncate({ cascade: true });
  });

  test('should create a new return log', async () => {
    const animal = await Animal.create({
      tag_number: 'A100',
      name: 'Bessie',
      type: 'Cow',
      age: 4,
      gender: 'Female'
    });

    const response = await request(server)
      .post('/api/return-logs')
      .send({
        animal_id: animal.id,
        return_date: '2023-01-01',
        return_reason: 'Routine checkup',
        notes: 'No issues found'
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
  });

  test('should get return logs by animal', async () => {
    const animal = await Animal.create({
      tag_number: 'A100',
      name: 'Bessie',
      type: 'Cow',
      age: 4,
      gender: 'Female'
    });

    await ReturnLog.create({
      animal_id: animal.id,
      date: '2023-01-01',
      reason: 'Routine checkup'
    });

    const response = await request(server)
      .get(`/api/return-logs/animal/${animal.id}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
  });

  test('should return 400 for invalid return log data', async () => {
    const response = await request(server)
      .post('/api/return-logs')
      .send({
        return_date: '2023-01-01',
        // Missing required fields
      });
    expect(response.statusCode).toBe(400);
  });

  test('should update a return log', async () => {
    const animal = await Animal.create({
      tag_number: 'A100',
      name: 'Bessie',
      type: 'Cow',
      age: 4,
      gender: 'Female'
    });

    const returnLog = await ReturnLog.create({
      animal_id: animal.id,
      date: '2023-01-01',
      reason: 'Routine checkup'
    });

    const response = await request(server)
      .put(`/api/return-logs/${returnLog.id}`)
      .send({
        return_reason: 'Medical treatment'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.reason).toBe('Medical treatment');
  });

  test('should delete a return log', async () => {
    const animal = await Animal.create({
      tag_number: 'A100',
      name: 'Bessie',
      type: 'Cow',
      age: 4,
      gender: 'Female'
    });

    const returnLog = await ReturnLog.create({
      animal_id: animal.id,
      date: '2023-01-01',
      reason: 'Routine checkup'
    });

    const response = await request(server)
      .delete(`/api/return-logs/${returnLog.id}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Return log deleted');
  });
});
