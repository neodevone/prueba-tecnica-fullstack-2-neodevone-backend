const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Program = require('../models/Program');
const User = require('../models/User');

let authToken;

describe('Programs API', () => {
  beforeAll(async () => {
    // Limpiar base de datos
    await Program.deleteMany({});
    await User.deleteMany({});
  });

  beforeEach(async () => {
    await Program.deleteMany({});
    await User.deleteMany({});

    // Crear usuario admin para testing
    const admin = await User.create({
      fullName: 'Test Admin',
      email: 'admin@test.com',
      password: 'password123',
      programId: new mongoose.Types.ObjectId(),
      role: 'admin',
    });

    // Login para obtener token
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'password123',
      });

    authToken = res.body.data.token;
  });

  describe('GET /api/programs', () => {
    it('should get all programs', async () => {
      // Crear programas de prueba
      await Program.create([
        {
          name: 'Test Program 1',
          description: 'Test Description 1',
          startDate: new Date('2024-01-01'),
        },
        {
          name: 'Test Program 2',
          description: 'Test Description 2',
          startDate: new Date('2024-02-01'),
        },
      ]);

      const res = await request(app).get('/api/programs');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(2);
      expect(res.body.data.total).toBe(2);
    });

    it('should filter programs by name', async () => {
      await Program.create([
        {
          name: 'Medical Program',
          description: 'Medical description',
          startDate: new Date('2024-01-01'),
        },
        {
          name: 'Surgery Program',
          description: 'Surgery description',
          startDate: new Date('2024-02-01'),
        },
      ]);

      const res = await request(app)
        .get('/api/programs?filter=Medical');

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].name).toBe('Medical Program');
    });

    it('should paginate programs', async () => {
      // Crear más programas para probar paginación
      const programs = [];
      const baseDate = new Date('2024-01-01');

      for (let i = 1; i <= 15; i++) {
        const programDate = new Date(baseDate);
        programDate.setMonth(baseDate.getMonth() + i - 1); // Meses válidos

        programs.push({
          name: `Program ${i}`,
          description: `Description ${i}`,
          startDate: programDate,
        });
      }
      await Program.create(programs);

      const res = await request(app)
        .get('/api/programs?page=2&limit=5');

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.items).toHaveLength(5);
      expect(res.body.data.page).toBe(2);
      expect(res.body.data.total).toBe(15);
    });
  });

  describe('POST /api/programs', () => {
    it('should create a new program with admin auth', async () => {
      const programData = {
        name: 'New Program',
        description: 'New Program Description',
        startDate: '2024-06-01',
      };

      const res = await request(app)
        .post('/api/programs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(programData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(programData.name);
      expect(res.body.data.description).toBe(programData.description);
    });

    it('should not create program without admin auth', async () => {
      const res = await request(app)
        .post('/api/programs')
        .send({
          name: 'New Program',
          description: 'New Program Description',
          startDate: '2024-06-01',
        });

      expect(res.statusCode).toEqual(401);
    });

    it('should validate program data', async () => {
      const res = await request(app)
        .post('/api/programs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Datos inválidos - falta nombre y descripción
          startDate: '2024-06-01',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/programs/:id', () => {
    it('should get a specific program', async () => {
      const program = await Program.create({
        name: 'Specific Program',
        description: 'Specific Description',
        startDate: new Date('2024-01-01'),
      });

      const res = await request(app)
        .get(`/api/programs/${program._id}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Specific Program');
    });

    it('should return 404 for non-existent program', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/programs/${nonExistentId}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
    });
  });
});