import { prisma } from '../../prismaClient.js';

export class PrismaTugasRepository {
  async findAllTugas(filter = {}) {
    const where = {};
    if (filter.idMataKuliah) {
      if (typeof filter.idMataKuliah === 'object' && filter.idMataKuliah.in) {
        where.idMataKuliah = { in: filter.idMataKuliah.in.map(id => parseInt(id)) };
      } else {
        where.idMataKuliah = parseInt(filter.idMataKuliah);
      }
    }

    const allTugas = await prisma.tugas.findMany({
      where,
      include: {
        mataKuliah: true,
        pengumpulanTugas: filter.nis ? { where: { nis: filter.nis } } : false
      },
      orderBy: { deadlineTugas: 'asc' }
    });

    // Deduplicate: satu tugas (judul+matkul+deadline) hanya tampil 1x
    const seen = new Map();
    for (const t of allTugas) {
      const key = `${t.judul}__${t.idMataKuliah}__${t.deadlineTugas?.toISOString() || ''}`;
      if (!seen.has(key)) {
        seen.set(key, t);
      } else if (filter.nis) {
        // Kalau filter nis, utamakan row yang nisnya cocok
        if (t.nis === filter.nis) seen.set(key, t);
      }
    }

    return Array.from(seen.values());
  }

  async findTugasById(idTugas) {
    return await prisma.tugas.findUnique({
      where: { idTugas: parseInt(idTugas) },
      include: { mataKuliah: true, pengumpulanTugas: { include: { siswa: true } } }
    });
  }

  async findPengumpulanByNisAndTugas(nis, idTugas) {
    return await prisma.pengumpulanTugas.findFirst({
      where: { nis, idTugas: parseInt(idTugas) }
    });
  }

  async createPengumpulan(data) {
    return await prisma.pengumpulanTugas.create({
      data: {
        idTugas: parseInt(data.idTugas),
        nis: data.nis,
        judul: data.judul,
        detailTugas: data.detailTugas,
        fileJawaban: data.fileJawaban,
        deadlineTugas: data.deadlineTugas ? new Date(data.deadlineTugas) : null,
        idKelompok: data.idKelompok ? parseInt(data.idKelompok) : null
      }
    });
  }

  async updatePengumpulan(id, data) {
    return await prisma.pengumpulanTugas.update({
      where: { idPengumpulan: parseInt(id) },
      data: {
        judul: data.judul,
        detailTugas: data.detailTugas,
        fileJawaban: data.fileJawaban,
      }
    });
  }

  async getSubmission(idTugas, nis) {
    return await this.findPengumpulanByNisAndTugas(nis, idTugas);
  }

  async findKelompokByNis(nis, idMataKuliah) {
    return await prisma.anggotaKelompok.findFirst({
      where: {
        nis: nis,
        kelompok: { idMataKuliah: parseInt(idMataKuliah) }
      },
      include: {
        kelompok: {
          include: {
            anggota: { select: { nis: true } }
          }
        }
      }
    });
  }

  async deleteSubmission(idPengumpulan) {
    return await prisma.pengumpulanTugas.delete({
      where: { idPengumpulan: parseInt(idPengumpulan) }
    });
  }
}
