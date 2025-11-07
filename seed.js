const mongoose = require('mongoose');
const Program = require('./src/models/Program');
const User = require('./src/models/User');
require('dotenv').config();

const seedData = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Database connected successfully');

    // Clear existing data
    console.log('Clearing existing data...');
    await Program.deleteMany({});
    await User.deleteMany({});

    // Create programs
    console.log('Creating programs...');
    const programs = await Program.create([
      {
        name: 'Fundamentos de Programación',
        description: 'Aprende los conceptos básicos de programación desde cero',
        startDate: new Date('2025-12-15'),
        status: 'active',
      },
      {
        name: 'Desarrollo Web Full Stack',
        description: 'Domina el desarrollo web frontend y backend',
        startDate: new Date('2025-11-20'),
        status: 'active',
      },
      {
        name: 'Ciencia de Datos',
        description: 'Introducción al análisis de datos y machine learning',
        startDate: new Date('2025-11-29'),
        status: 'active',
      },
      {
        name: 'Diseño UX/UI',
        description: 'Aprende diseño de interfaces y experiencia de usuario',
        startDate: new Date('2025-12-05'),
        status: 'inactive',
      },
    ]);

    // Create admin user (con programId)
    console.log('Creating admin user...');
    await User.create({
      fullName: 'Admin User',
      email: 'admin@globalmedicine.org',
      password: 'admin123',
      role: 'admin',
    });

    // Create student users (SIN programId inicialmente)
    console.log('Creating student users...');
    await User.create([
      {
        fullName: 'John Smith',
        email: 'john.smith@example.com',
        password: 'student123',
        role: 'student',
        // Sin programId - el admin lo asignará después
      },
      {
        fullName: 'Maria Garcia',
        email: 'maria.garcia@example.com',
        password: 'student123',
        role: 'student',
      },
      {
        fullName: 'David Johnson',
        email: 'david.johnson@example.com',
        password: 'student123',
        role: 'student',
      },
      {
        fullName: 'Ana López',
        email: 'ana.lopez@example.com',
        password: 'student123',
        role: 'student',
      },
    ]);

    console.log('✅ Seed data created successfully!');
    console.log(`📚 Programs created: ${programs.length}`);
    console.log('👤 Admin user: admin@globalmedicine.org / admin123');
    console.log('🎓 Student users: john.smith@example.com / student123');
    console.log('🎓 Student users: maria.garcia@example.com / student123');
    console.log('🎓 Student users: david.johnson@example.com / student123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed data error:', error);
    process.exit(1);
  }
};

seedData();