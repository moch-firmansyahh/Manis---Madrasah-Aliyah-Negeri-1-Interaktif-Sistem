import { prisma } from '../../prismaClient.js';

// Helper untuk mendapatkan start/end of day dalam UTC
function getStartOfDayUTC() {
    const now = new Date();
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0));
}

function getEndOfDayUTC() {
    const now = new Date();
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999));
}

export class PrismaPresensiRepository {
  
  /**
   * Mengambil daftar hadir siswa untuk ditampilkan di Dashboard Guru (presensi.jsx)
   * Mengembalikan daftar siswa UNIK yang terdaftar di mata kuliah tersebut
   * @param {number} idMataKuliah 
   */
  async getDaftarHadirSiswa(idMataKuliah) {
    // 1. Ambil daftar siswa UNIK yang terdaftar di mata kuliah ini
    // dari berbagai sumber: nilai, presensi, kelompok, tugas
    const mataKuliah = await prisma.mataKuliah.findUnique({
      where: { idMataKuliah: idMataKuliah },
      include: {
        nilai: {
          include: {
            siswa: {
              include: {
                user: { select: { nama: true } }
              }
            }
          }
        },
        presensi: {
          include: {
            siswa: {
              include: {
                user: { select: { nama: true } }
              }
            }
          }
        },
        kelompok: {
          include: {
            anggota: {
              include: {
                siswa: {
                  include: {
                    user: { select: { nama: true } }
                  }
                }
              }
            }
          }
        }
      }
    });

    // 2. Kumpulkan semua siswa unik dalam Map (key: nis)
    const siswaMap = new Map();
    
    // Dari nilai
    mataKuliah?.nilai?.forEach(n => {
      if (n.siswa) {
        siswaMap.set(n.siswa.nis, n.siswa);
      }
    });
    
    // Dari presensi
    mataKuliah?.presensi?.forEach(p => {
      if (p.siswa) {
        siswaMap.set(p.siswa.nis, p.siswa);
      }
    });
    
    // Dari kelompok
    mataKuliah?.kelompok?.forEach(k => {
      k.anggota?.forEach(a => {
        if (a.siswa) {
          siswaMap.set(a.siswa.nis, a.siswa);
        }
      });
    });

    // 3. Jika belum ada siswa terdaftar, ambil semua siswa dari sistem
    // sebagai fallback (untuk presensi pertama kali)
    if (siswaMap.size === 0) {
      const allSiswa = await prisma.siswa.findMany({
        include: { user: { select: { nama: true } } }
      });
      allSiswa.forEach(m => {
        siswaMap.set(m.nis, m);
      });
    }

    // 4. Ambil presensi terbaru untuk setiap siswa di mata kuliah ini
    const today = getStartOfDayUTC();
    const tomorrow = getEndOfDayUTC();

    const siswaList = Array.from(siswaMap.values());
    
    // 4. Untuk setiap siswa, ambil presensi terbaru (hari ini atau terakhir)
    const result = await Promise.all(
      siswaList.map(async (mhs, index) => {
        // Cari presensi untuk HARI INI (sama seperti logic scan QR)
        const presensiTerbaru = await prisma.presensi.findFirst({
          where: {
            nis: mhs.nis,
            idMataKuliah: idMataKuliah,
            tanggalPertemuan: {
              gte: today,
              lt: tomorrow
            }
          },
          orderBy: { tanggalPertemuan: 'desc' }
        });

        // Membuat inisial nama (Misal: "Budi Santoso" -> "BU")
        const initials = mhs.user?.nama?.substring(0, 2).toUpperCase() || 'NA';
        
        // Warna acak untuk avatar frontend
        const colors = ["#8991fe", "#f59e0b", "#10b981", "#ec4899", "#6366f1"];
        const randomColor = colors[index % colors.length];

        return {
          id: presensiTerbaru?.idPresensi || `${mhs.nis}-${Date.now()}`,
          nis: mhs.nis,
          name: mhs.user?.nama || 'Unknown',
          initials: initials,
          color: randomColor,
          status: presensiTerbaru?.statusKehadiran || 'Alpa',
          tanggalPertemuan: presensiTerbaru?.tanggalPertemuan || null,
          waktuPresensi: presensiTerbaru?.waktuPresensi || null
        };
      })
    );

    // 5. Urutkan berdasarkan NIS
    return result.sort((a, b) => a.nis.localeCompare(b.nis));
  }

  /**
   * Mengubah status absensi siswa secara manual (Guru mengubah lewat UI)
   * @param {number} idPresensi 
   * @param {string} statusKehadiran ('Hadir', 'Izin', 'Sakit', 'Alpha')
   */
  async updateStatus(idPresensi, statusKehadiran) {
    return await prisma.presensi.update({
      where: { idPresensi: idPresensi },
      data: { statusKehadiran: statusKehadiran }
    });
  }

  /**
   * Update atau buat presensi untuk siswa berdasarkan NIS dan mata kuliah
   * Jika belum ada presensi hari ini, buat baru
   * @param {string} nis 
   * @param {number} idMataKuliah 
   * @param {string} statusKehadiran 
   */
  async updateStatusByNis(nis, idMataKuliah, statusKehadiran) {
    // Cari presensi hari ini untuk siswa ini (pakai UTC helper)
    const today = getStartOfDayUTC();
    const tomorrow = getEndOfDayUTC();

    let presensiHariIni = await prisma.presensi.findFirst({
      where: {
        nis: nis,
        idMataKuliah: idMataKuliah,
        tanggalPertemuan: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    if (presensiHariIni) {
      // Update presensi yang sudah ada
      return await prisma.presensi.update({
        where: { idPresensi: presensiHariIni.idPresensi },
        data: { 
          statusKehadiran: statusKehadiran,
          waktuPresensi: new Date()
        }
      });
    } else {
      // Buat presensi baru untuk hari ini dengan tanggal UTC yang konsisten
      return await prisma.presensi.create({
        data: {
          nis: nis,
          idMataKuliah: idMataKuliah,
          tanggalPertemuan: today,  // Pakai today UTC yang sama
          waktuPresensi: new Date(),
          statusKehadiran: statusKehadiran
        }
      });
    }
  }

  /**
   * Menandai status kehadiran menjadi "Hadir" saat Siswa melakukan Scan QR Code
   * @param {string} nis 
   * @param {number} idMataKuliah 
   */
  async markAsHadir(nis, idMataKuliah, tokenScan) {
    // Validasi nis ada di tabel siswa
    const siswa = await prisma.siswa.findUnique({
      where: { nis: nis }
    });

    if (!siswa) {
      throw new Error('Data siswa tidak ditemukan. Silakan login ulang.');
    }

    // Cari record presensi HARI INI untuk siswa ini di mata kuliah ini
    const today = getStartOfDayUTC();
    const tomorrow = getEndOfDayUTC();

    let presensiSesiIni = await prisma.presensi.findFirst({
      where: {
        nis: nis,
        idMataKuliah: idMataKuliah,
        tanggalPertemuan: {
          gte: today,
          lt: tomorrow
        }
      },
      orderBy: {
        tanggalPertemuan: 'desc'
      }
    });
    
    // Jika belum ada record sama sekali, buat baru
    if (!presensiSesiIni) {
      presensiSesiIni = await prisma.presensi.create({
        data: {
          nis: nis,
          idMataKuliah: idMataKuliah,
          tanggalPertemuan: today,  // Pakai today UTC yang sama
          waktuPresensi: new Date(),
          statusKehadiran: 'Hadir'
        }
      });
      return { message: 'Absen berhasil!', presensi: presensiSesiIni };
    }

    // Update status menjadi Hadir dengan waktu saat ini
    const updated = await prisma.presensi.update({
      where: { idPresensi: presensiSesiIni.idPresensi },
      data: { 
        statusKehadiran: 'Hadir',
        waktuPresensi: new Date()
      }
    });
    return updated;
  }

  async getRiwayatKehadiran(nis, idMataKuliah) {
    return await prisma.presensi.findMany({
      where: { nis, idMataKuliah },
      orderBy: { tanggalPertemuan: 'desc' }
    });
  }

  async buatSesiPresensi(idMataKuliah) {
    const semuaSiswa = await prisma.siswa.findMany();
    
    if (semuaSiswa.length === 0) {
      throw new Error('Tidak ada siswa yang terdaftar');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingSession = await prisma.presensi.findFirst({
      where: {
        idMataKuliah: idMataKuliah,
        tanggalPertemuan: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    if (existingSession) {
      return { message: 'Sesi sudah ada untuk hari ini' };
    }

    const createMany = semuaSiswa.map(m => ({
      nis: m.nis,
      idMataKuliah: idMataKuliah,
      tanggalPertemuan: new Date(),
      statusKehadiran: 'Alpha'
    }));

    await prisma.presensi.createMany({
      data: createMany
    });

    return { message: 'Sesi presensi berhasil dibuat', count: semuaSiswa.length };
  }
}