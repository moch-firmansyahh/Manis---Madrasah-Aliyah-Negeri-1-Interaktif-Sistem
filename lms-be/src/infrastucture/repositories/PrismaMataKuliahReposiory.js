import { prisma } from "../../../lib/prisma.ts";

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
        }
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
        }
      },
      orderBy: { idMataKuliah: 'asc' }
    });
  }

  async findByNis(nis) {
    // Mata kuliah yang diikuti siswa, melalui relasi Nilai, Presensi, Tugas, atau Kelompok
    const courses = await prisma.mataKuliah.findMany({
      where: {
        OR: [
          { nilai: { some: { nomorInduk: nis } } },
          { presensi: { some: { nis: nis } } },
          { tugas: { some: { nis: nis } } },
          { kelompok: { some: { anggota: { some: { nis: nis } } } } }
        ],
      },
      include: {
        guru: {
          include: { user: { select: { nama: true } } }
        }
      },
      orderBy: { idMataKuliah: "asc" },
    });

    if (courses.length === 0) return [];

    // Filter hanya semester terakhir (semester aktif)
    const maxSemester = Math.max(...courses.map(c => c.semester));
    return courses.filter(c => c.semester === maxSemester);
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
