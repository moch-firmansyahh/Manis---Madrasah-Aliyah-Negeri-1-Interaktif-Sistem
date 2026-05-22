import { prisma } from './lib/prisma.ts';

async function main() {
  const presensi = await prisma.presensi.findMany({
    orderBy: { idPresensi: 'desc' },
    take: 5
  });
  console.log(JSON.stringify(presensi, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
