import { prisma } from "../../prismaClient.js";

export class PrismaMataKuliahRepository {
  async create(data) {
    // Hapus idMataKuliah dari data agar auto-increment berjalan
    const { idMataKuliah, ...createData } = data;
    return await prisma.mataKuliah.create({ data: createData });
  }

  async findAll() {
    return await prisma.mataKuliah.findMany({
      include: {
        guru: {
          include: { user: { select: { nama: true } } }
        },
        kelas: true
      },
      orderBy: { idMataKuliah: 'asc' }
    });
  }

  async findByGuru(nipGuru) {
    return await prisma.mataKuliah.findMany({
      where: { nipGuru },
      include: {
        guru: {
          include: { user: { select: { nama: true } } }
        },
        kelas: true
      },
      orderBy: { idMataKuliah: 'asc' }
    });
  }

  async findByNis(nis) {
    const siswa = await prisma.siswa.findUnique({ where: { nis } });
    if (!siswa || !siswa.idKelas) return [];
    
    return await prisma.mataKuliah.findMany({
      where: { idKelas: siswa.idKelas },
      include: {
        guru: {
          include: { user: { select: { nama: true } } }
        },
        kelas: true
      },
      orderBy: { idMataKuliah: "asc" },
    });
  }

  async findById(id) {
    return await prisma.mataKuliah.findUnique({
      where: { idMataKuliah: parseInt(id) },
      include: {
        guru: {
          include: { user: { select: { nama: true, email: true } } }
        }
      }
    });
  }

  async update(id, data) {
    return await prisma.mataKuliah.update({
      where: { idMataKuliah: parseInt(id) },
      data,
    });
  }

  async delete(id) {
    return await prisma.mataKuliah.delete({
      where: { idMataKuliah: parseInt(id) },
    });
  }
}
