
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding...');
  const hotels = [];

  for (let i = 0; i < 1000; i++) {
    const city = faker.location.city();
    const country = faker.location.country();
    const hotel = {
      name: faker.company.name() + ' Hotel',
      description: faker.lorem.paragraph(),
      location: `${city}, ${country}`,
    };
    hotels.push(hotel);
  }

  await prisma.hotel.createMany({
    data: hotels,
    skipDuplicates: true,
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
