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
        pengumpulanTugas: filter.nim ? { where: { nim: filter.nim } } : false
      },
      orderBy: { deadlineTugas: 'asc' }
    });

    // Deduplicate: satu tugas (judul+matkul+deadline) hanya tampil 1x
    const seen = new Map();
    for (const t of allTugas) {
      const key = `${t.judul}__${t.idMataKuliah}__${t.deadlineTugas?.toISOString() || ''}`;
      if (!seen.has(key)) {
        seen.set(key, t);
      } else if (filter.nim) {
        // Kalau filter nim, utamakan row yang nimnya cocok
        if (t.nim === filter.nim) seen.set(key, t);
      }
    }

    return Array.from(seen.values());
  }

  async findTugasById(idTugas) {
    return await prisma.tugas.findUnique({
      where: { idTugas: parseInt(idTugas) },
      include: { mataKuliah: true, pengumpulanTugas: { include: { mahasiswa: true } } }
    });
  }

  async findPengumpulanByNimAndTugas(nim, idTugas) {
    return await prisma.pengumpulanTugas.findFirst({
      where: { nim, idTugas: parseInt(idTugas) }
    });
  }

  async createPengumpulan(data) {
    return await prisma.pengumpulanTugas.create({
      data: {
        idTugas: parseInt(data.idTugas),
        nim: data.nim,
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

  async getSubmission(idTugas, nim) {
    return await this.findPengumpulanByNimAndTugas(nim, idTugas);
  }

  async findKelompokByNim(nim, idMataKuliah) {
    return await prisma.anggotaKelompok.findFirst({
      where: {
        nim: nim,
        kelompok: { idMataKuliah: parseInt(idMataKuliah) }
      },
      include: {
        kelompok: {
          include: {
            anggota: { select: { nim: true } }
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
