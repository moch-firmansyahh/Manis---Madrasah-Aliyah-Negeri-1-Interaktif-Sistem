import { prisma } from '../../../lib/prisma.ts';

export class PrismaNilaiRepository {

  async create(data) {
    return await prisma.nilai.create({ 
      data,
      include: { user: true, mataKuliah: true }
    });
  }

  async findAll() {
    return await prisma.nilai.findMany({
      include: { user: { select: { nama: true } }, mataKuliah: true }
    });
  }

  async findBySiswa(nomorInduk) {
    return await prisma.nilai.findMany({
      where: { nomorInduk },
      include: { mataKuliah: true }
    });
  }

  async findBySiswaAndMataKuliah(nomorInduk, idMataKuliah) {
    return await prisma.nilai.findFirst({
      where: { nomorInduk, idMataKuliah },
      include: { mataKuliah: true }
    });
  }

  async findById(id) {
    return await prisma.nilai.findUnique({
      where: { idNilai: parseInt(id) }
    });
  }

  async update(id, data) {
    return await prisma.nilai.update({
      where: { idNilai: parseInt(id) },
      data: data,
      include: { user: { select: { nama: true } }, mataKuliah: true }
    });
  }

  async delete(id) {
    return await prisma.nilai.delete({
      where: { idNilai: parseInt(id) }
    });
  }

  async getNilaiByNomorInduk(nomorInduk) {
    return await prisma.nilai.findMany({
      where: { nomorInduk: nomorInduk },
      include: { mataKuliah: true }
    });
  }

  async getPengumpulanIndividu(idMataKuliah) {
    try {
      const intIdMk = parseInt(idMataKuliah);
      
      // Ambil semua pengumpulan tugas untuk mata kuliah ini (individu & kelompok)
      // Nanti difilter di frontend atau berdasarkan ada/tidaknya idKelompok
      const result = await prisma.pengumpulanTugas.findMany({
        where: { 
          tugas: {
            idMataKuliah: intIdMk
          }
        },
        include: { 
          siswa: {
            include: { 
              user: {
                select: { nama: true, nomorInduk: true }
              }
            }
          },
          tugas: true
        },
        orderBy: { deadlineTugas: 'desc' }
      });
      
      return result;
    } catch (error) {
      console.error("[Repository] getPengumpulanIndividu error:", error.message);
      return [];
    }
  }

  async getNilaiTugas(nomorInduk, idMataKuliah) {
    return await prisma.nilai.findFirst({
      where: { 
        nomorInduk: nomorInduk, 
        idMataKuliah: parseInt(idMataKuliah) 
      }
    });
  }

  async getTugasByMataKuliah(idMataKuliah) {
    const intIdMk = parseInt(idMataKuliah);
    const allTugas = await prisma.tugas.findMany({
      where: { idMataKuliah: intIdMk },
      include: { mataKuliah: true },
      orderBy: { deadlineTugas: 'asc' }
    });
    // Deduplicate berdasarkan judul + deadline
    const seen = new Map();
    for (const t of allTugas) {
      const key = `${t.judul}__${t.deadlineTugas?.toISOString() || ''}`;
      if (!seen.has(key)) seen.set(key, t);
    }
    return Array.from(seen.values());
  }

  async getPengumpulanPerTugas(idTugas) {
    // Karena tugas dibuat per siswa (1 row per siswa per tugas),
    // cari semua idTugas yang punya judul+idMataKuliah+deadline yang sama
    const tugasRef = await prisma.tugas.findUnique({
      where: { idTugas: parseInt(idTugas) }
    });
    if (!tugasRef) return [];

    const semuaIdTugas = await prisma.tugas.findMany({
      where: {
        judul: tugasRef.judul,
        idMataKuliah: tugasRef.idMataKuliah,
        deadlineTugas: tugasRef.deadlineTugas
      },
      select: { idTugas: true }
    });
    const idTugasList = semuaIdTugas.map(t => t.idTugas);

    return await prisma.pengumpulanTugas.findMany({
      where: {
        idTugas: { in: idTugasList }
      },
      include: {
        siswa: {
          include: { user: { select: { nama: true, nomorInduk: true } } }
        }
      },
      orderBy: { idPengumpulan: 'asc' }
    });
  }

  async getSiswaByMataKuliah(idMataKuliah) {
    const intIdMk = parseInt(idMataKuliah);
    // Kumpulkan dari presensi, kelompok, dan nilai
    const nisSet = new Set();
    const presensi = await prisma.presensi.findMany({ where: { idMataKuliah: intIdMk }, select: { nis: true } });
    presensi.forEach(p => nisSet.add(p.nis));
    const kelompok = await prisma.kelompok.findMany({ where: { idMataKuliah: intIdMk }, include: { anggota: { select: { nis: true } } } });
    kelompok.forEach(k => k.anggota.forEach(a => nisSet.add(a.nis)));
    const tugas = await prisma.tugas.findMany({ where: { idMataKuliah: intIdMk }, select: { nis: true } });
    tugas.forEach(t => nisSet.add(t.nis));
    if (nisSet.size === 0) return [];
    return await prisma.siswa.findMany({
      where: { nis: { in: Array.from(nisSet) } },
      include: { user: { select: { nama: true, nomorInduk: true } } }
    });
  }

  async upsertNilaiTugas(nomorInduk, idMataKuliah, nilaiTugas) {
    const existing = await this.getNilaiTugas(nomorInduk, idMataKuliah);
    if (existing) {
      return await prisma.nilai.update({
        where: { idNilai: existing.idNilai },
        data: { 
          nilaiTugas: parseFloat(nilaiTugas),
          nilaiAkhir: parseFloat(nilaiTugas)
        }
      });
    }
    return await prisma.nilai.create({
      data: {
        nomorInduk,
        idMataKuliah: parseInt(idMataKuliah),
        nilaiTugas: parseFloat(nilaiTugas),
        nilaiAkhir: parseFloat(nilaiTugas)
      }
    });
  }

  async getKuisByMataKuliah(idMataKuliah) {
    const intIdMk = parseInt(idMataKuliah);
    return await prisma.kuis.findMany({
      where: { idMataKuliah: intIdMk },
      orderBy: { idKuis: 'asc' }
    });
  }

  async getJawabanKuisPerKuis(idKuis) {
    return await prisma.jawabanKuis.findMany({
      where: { idKuis: parseInt(idKuis) },
      include: {
        siswa: {
          include: { user: { select: { nama: true, nomorInduk: true } } }
        }
      },
      orderBy: { idJawabanKuis: 'asc' }
    });
  }
}