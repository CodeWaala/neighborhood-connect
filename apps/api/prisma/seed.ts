import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const interests = [
  { label: 'Stroller walks', category: 'parent' },
  { label: 'Coffee outings', category: 'social' },
  { label: 'Park visits', category: 'outdoors' },
  { label: 'Dog walks', category: 'pet' },
  { label: 'Casual chats', category: 'social' },
];

const availabilityWindows = [
  { label: 'Morning', timeRange: '6am-12pm' },
  { label: 'Afternoon', timeRange: '12pm-5pm' },
  { label: 'Evening', timeRange: '5pm-9pm' },
];

const neighborhoods = [
  { name: 'Riverside', city: 'Portland', region: 'OR', postalCode: '97201' },
  { name: 'Oak Park', city: 'Portland', region: 'OR', postalCode: '97202' },
  { name: 'Sellwood', city: 'Portland', region: 'OR', postalCode: '97202' },
  { name: 'Pearl District', city: 'Portland', region: 'OR', postalCode: '97209' },
  { name: 'Hawthorne', city: 'Portland', region: 'OR', postalCode: '97214' },
  { name: 'Alberta Arts', city: 'Portland', region: 'OR', postalCode: '97211' },
  { name: 'Division', city: 'Portland', region: 'OR', postalCode: '97202' },
  { name: 'Mississippi', city: 'Portland', region: 'OR', postalCode: '97217' },
];

async function main() {
  console.log('Seeding interests...');
  for (const interest of interests) {
    await prisma.interest.upsert({
      where: { label: interest.label },
      update: {},
      create: {
        label: interest.label,
        category: interest.category,
      },
    });
  }

  console.log('Seeding availability windows...');
  for (const window of availabilityWindows) {
    await prisma.availabilityWindow.upsert({
      where: { label: window.label },
      update: {},
      create: window,
    });
  }

  console.log('Seeding neighborhoods...');
  for (const neighborhood of neighborhoods) {
    const existing = await prisma.neighborhood.findFirst({
      where: { name: neighborhood.name, city: neighborhood.city },
    });
    if (!existing) {
      await prisma.neighborhood.create({ data: neighborhood });
    }
  }

  console.log('Seed complete.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
