import { prisma } from './src/prismaClient.js';

async function fixSequence() {
  try {
    await prisma.$executeRaw`SELECT setval('"MataKuliah_idMataKuliah_seq"', COALESCE((SELECT MAX("idMataKuliah") + 1 FROM "MataKuliah"), 1), false);`;
    console.log("✅ Sequence berhasil diperbaiki!");
  } catch (e) {
    console.error("Gagal:", e);
  } finally {
    await prisma.$disconnect();
  }
}
fixSequence();
