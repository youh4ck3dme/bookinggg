// File: /apps/api/prisma/seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'tenant_1' },
    update: {},
    create: {
      slug: 'tenant_1',
      name: 'Default Tenant',
      timezone: 'Europe/Bratislava',
    },
  });

  console.log('Created tenant:', tenant);

  // Create mock integration
  const integration = await prisma.integration.upsert({
    where: { id: 'mock-integration-1' },
    update: {},
    create: {
      id: 'mock-integration-1',
      tenantId: tenant.id,
      providerKey: 'mock',
      isEnabled: true,
      settings: {},
    },
  });

  console.log('Created integration:', integration);
  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
