import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Create Admin User
  const adminPassword = await bcrypt.hash('Admin123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ds160helper.com' },
    update: {},
    create: {
      email: 'admin@ds160helper.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  console.log('✅ Admin user created:');
  console.log('   Email: admin@ds160helper.com');
  console.log('   Password: Admin123!');
  console.log('   Role: ADMIN\n');

  // Create a test regular user
  const userPassword = await bcrypt.hash('User123!', 12);

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: userPassword,
      name: 'Test User',
      role: 'USER',
      emailVerified: true,
    },
  });

  console.log('✅ Test user created:');
  console.log('   Email: user@example.com');
  console.log('   Password: User123!');
  console.log('   Role: USER\n');

  // Create sample inquiries
  const inquiries = await Promise.all([
    prisma.inquiry.create({
      data: {
        userId: user.id,
        name: 'John Smith',
        email: 'john@example.com',
        phone: '+1-555-123-4567',
        message: 'I need help with my B1/B2 tourist visa application.',
        serviceType: 'VISA_APPLICATION',
        status: 'PENDING',
      },
    }),
    prisma.inquiry.create({
      data: {
        userId: user.id,
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+1-555-987-6543',
        message: 'Looking for consultation regarding my student visa options.',
        serviceType: 'CONSULTATION',
        status: 'IN_PROGRESS',
      },
    }),
    prisma.inquiry.create({
      data: {
        name: 'Guest User',
        email: 'guest@example.com',
        phone: '+1-555-456-7890',
        message: 'Can you review my documents before I apply?',
        serviceType: 'DOCUMENT_REVIEW',
        status: 'PENDING',
      },
    }),
  ]);

  console.log(`✅ Created ${inquiries.length} sample inquiries\n`);

  // Create a sample application
  const application = await prisma.application.create({
    data: {
      userId: user.id,
      visaType: 'B1_B2',
      status: 'DRAFT',
      currentStep: 1,
      personalInfo: JSON.stringify({
        surnames: 'SMITH',
        givenNames: 'JOHN MICHAEL',
        dateOfBirth: '1990-05-15',
        cityOfBirth: 'New York',
        countryOfBirth: 'United States',
        nationality: 'United States',
      }),
    },
  });

  console.log('✅ Created sample application\n');

  console.log('=' .repeat(50));
  console.log('🎉 Database seeding completed successfully!');
  console.log('=' .repeat(50));
  console.log('\n📋 Admin Credentials:');
  console.log('   URL: http://localhost:5173/login');
  console.log('   Email: admin@ds160helper.com');
  console.log('   Password: Admin123!');
  console.log('\n📋 Test User Credentials:');
  console.log('   Email: user@example.com');
  console.log('   Password: User123!\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
