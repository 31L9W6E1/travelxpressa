import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Resetting all locked accounts...');

  // Reset all users' failed login attempts and lockouts
  const result = await prisma.user.updateMany({
    data: {
      failedLogins: 0,
      lockedUntil: null,
    },
  });

  console.log(`Reset ${result.count} user accounts`);

  // List all users
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      failedLogins: true,
      lockedUntil: true,
    },
  });

  console.log('\nCurrent users:');
  users.forEach((user) => {
    console.log(`- ${user.email} (${user.role}) - Failed: ${user.failedLogins}, Locked: ${user.lockedUntil || 'No'}`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
