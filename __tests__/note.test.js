const request = require('supertest');
const app = require('../app');
const server = app.listen(0); // Use random available port
const { sequelize, Animal, Note } = require('../models');

afterAll(() => server.close());

describe('Note API', () => {
  beforeAll(async () => {
    await Animal.sync({ force: true });
    await Note.sync({ force: true });
  });

  afterEach(async () => {
    // Clear tables in reverse dependency order
    await Note.destroy({ where: {}, force: true });
    await Animal.destroy({ where: {}, force: true });
  });

  test('should create a new note', async () => {
    const animal = await Animal.create({
      tag_number: 'A100',
      name: 'Bessie',
      type: 'Cow',
      age: 4,
      gender: 'Female'
    });

    const response = await request(server)
      .post('/api/notes')
      .send({
        animal_id: animal.id,
        content: 'Healthy and active'
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
  });

  test('should get notes by animal', async () => {
    const animal = await Animal.create({
      tag_number: 'A100',
      name: 'Bessie',
      type: 'Cow',
      age: 4,
      gender: 'Female'
    });

    await Note.create({
      animal_id: animal.id,
      content: 'Healthy and active'
    });

    const response = await request(server)
      .get(`/api/notes/animal/${animal.id}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
  });

  test('should return 400 for invalid note data', async () => {
    const response = await request(server)
      .post('/api/notes')
      .send({
        // Missing required fields
      });
    expect(response.statusCode).toBe(400);
  });

  test('should update a note', async () => {
    const animal = await Animal.create({
      tag_number: 'A100',
      name: 'Bessie',
      type: 'Cow',
      age: 4,
      gender: 'Female'
    });

    const note = await Note.create({
      animal_id: animal.id,
      content: 'Healthy and active'
    });

    const response = await request(server)
      .put(`/api/notes/${note.id}`)
      .send({
        content: 'Slightly lethargic today'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.content).toBe('Slightly lethargic today');
  });

  test('should delete a note', async () => {
    const animal = await Animal.create({
      tag_number: 'A100',
      name: 'Bessie',
      type: 'Cow',
      age: 4,
      gender: 'Female'
    });

    const note = await Note.create({
      animal_id: animal.id,
      content: 'Healthy and active'
    });

    const response = await request(server)
      .delete(`/api/notes/${note.id}`);

    expect(response.statusCode).toBe(204);
  });
});
