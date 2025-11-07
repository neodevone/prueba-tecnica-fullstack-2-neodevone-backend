const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Program = require('../models/Program');

let authToken;
let testProgram;

describe('Users API', () => {
  beforeAll(async () => {
    // Limpiar base de datos
    await User.deleteMany({});
    await Program.deleteMany({});
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Program.deleteMany({});

    // Crear programa de prueba
    testProgram = await Program.create({
      name: 'Test Program',
      description: 'Test Program Description',
      startDate: new Date('2024-01-01'),
    });

    // Crear usuario admin para testing
    const admin = await User.create({
      fullName: 'Test Admin',
      email: 'admin@test.com',
      password: 'password123',
      programId: testProgram._id,
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

  describe('GET /api/users', () => {
    it('should get all users with admin auth', async () => {
      // Crear algunos usuarios de prueba
      await User.create([
        {
          fullName: 'Student 1',
          email: 'student1@test.com',
          password: 'password123',
          programId: testProgram._id,
          role: 'student',
        },
        {
          fullName: 'Student 2',
          email: 'student2@test.com',
          password: 'password123',
          programId: testProgram._id,
          role: 'student',
        },
      ]);

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(3); // 2 estudiantes + 1 admin
      expect(res.body.data.total).toBe(3);
    });

    it('should filter users by programId', async () => {
      const anotherProgram = await Program.create({
        name: 'Another Program',
        description: 'Another Program Description',
        startDate: new Date('2024-02-01'),
      });

      // Crear usuarios en diferentes programas
      await User.create([
        {
          fullName: 'Student Program 1',
          email: 'student1@test.com',
          password: 'password123',
          programId: testProgram._id,
          role: 'student',
        },
        {
          fullName: 'Student Program 2',
          email: 'student2@test.com',
          password: 'password123',
          programId: anotherProgram._id,
          role: 'student',
        },
      ]);

      const res = await request(app)
        .get(`/api/users?programId=${testProgram._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.items).toHaveLength(2); // 1 admin + 1 estudiante del programa
      expect(res.body.data.items[1].programId._id).toBe(testProgram._id.toString());
    });

    it('should not get users without admin auth', async () => {
      // Crear usuario estudiante (no admin)
      const student = await User.create({
        fullName: 'Regular Student',
        email: 'student@test.com',
        password: 'password123',
        programId: testProgram._id,
        role: 'student',
      });

      // Login como estudiante
      const studentLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'student@test.com',
          password: 'password123',
        });

      const studentToken = studentLogin.body.data.token;

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.statusCode).toEqual(403); // Forbidden
      expect(res.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .get('/api/users');

      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user with admin auth', async () => {
      const userData = {
        fullName: 'New Student',
        email: 'newstudent@test.com',
        password: 'password123',
        programId: testProgram._id,
      };

      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(userData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.fullName).toBe(userData.fullName);
      expect(res.body.data.email).toBe(userData.email);
      expect(res.body.data.programId._id).toBe(testProgram._id.toString());
    });

    it('should not create user with duplicate email', async () => {
      const userData = {
        fullName: 'Duplicate User',
        email: 'duplicate@test.com',
        password: 'password123',
        programId: testProgram._id,
      };

      // Crear usuario primero
      await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(userData);

      // Intentar crear otro con el mismo email
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(userData);

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Datos incompletos
          email: 'incomplete@test.com'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });

    it('should not create user without admin auth', async () => {
      const userData = {
        fullName: 'New Student',
        email: 'newstudent@test.com',
        password: 'password123',
        programId: testProgram._id,
      };

      const res = await request(app)
        .post('/api/users')
        .send(userData);

      expect(res.statusCode).toEqual(401);
    });
  });

  describe('User population', () => {
    it('should populate program details when getting users', async () => {
      await User.create({
        fullName: 'Test Student',
        email: 'teststudent@test.com',
        password: 'password123',
        programId: testProgram._id,
        role: 'student',
      });

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.items[1].programId).toHaveProperty('name');
      expect(res.body.data.items[1].programId).toHaveProperty('description');
      expect(res.body.data.items[1].programId.name).toBe('Test Program');
    });
  });
});