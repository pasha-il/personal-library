import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: { email: 'test@example.com', name: 'Test User' },
  });

  await prisma.book.upsert({
    where: { id: 'seed-book-1' },
    update: {},
    create: {
      id: 'seed-book-1',
      title: 'Seed Book',
      userId: user.id,
      authors: {
        create: [{ name: 'Seed Author' }],
      },
    },
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
