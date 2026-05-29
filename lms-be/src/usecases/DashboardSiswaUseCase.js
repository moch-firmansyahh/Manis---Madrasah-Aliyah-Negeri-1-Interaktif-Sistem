export class DashboardSiswaUseCase {
  constructor(mataKuliahRepository, forumRepository, prisma) {
    this.mataKuliahRepository = mataKuliahRepository;
    this.forumRepository = forumRepository;
    this.prisma = prisma;
  }

  async getDashboardData(nomorInduk, hariDariClient) {
    try {
      // Map nomorInduk (U001) ke nis asli (2026001) — dilakukan PALING ATAS
      const siswaData = await this.prisma.siswa.findUnique({
        where: { nomorInduk: nomorInduk },
      });
      const actualNis = siswaData ? siswaData.nis : nomorInduk;

      // Cari mata kuliah berdasarkan idKelas siswa secara langsung
      const mataKuliah = await this.prisma.mataKuliah.findMany({
        where: {
          idKelas: siswaData.idKelas
        },
        include: {
          guru: { include: { user: { select: { nama: true } } } },
        },
      });

      let mataKuliahList = mataKuliah;
      if (mataKuliahList.length === 0) {
        return {
          progress: {
            persentase: 0,
            tugasSelesai: 0,
            totalTugas: 0,
            perMataKuliah: [],
          },
          rataRataNilai: 0,
          sks: 0,
          mataKuliah: [],
          jadwal: [],
          threads: [],
        };
      }

      const maxSemester = Math.max(...mataKuliahList.map((mk) => mk.semester));
      if (maxSemester > 0) {
        mataKuliahList = mataKuliahList.filter(
          (mk) => mk.semester === maxSemester,
        );
      }

      const idMataKuliahList = mataKuliahList.map(mk => mk.idMataKuliah);
      const threads = (await this.forumRepository.getRecentThreads)
        ? await this.forumRepository.getRecentThreads(3, idMataKuliahList)
        : [];

      const jadwalData = await this.getJadwalMataKuliah(
        mataKuliahList,
        hariDariClient,
      );

      const tugasData = await this.getTugasProgress(actualNis, mataKuliahList);
      const totalTugas = tugasData.total;
      const tugasSelesai = tugasData.selesai;
      const persentase =
        totalTugas > 0 ? Math.round((tugasSelesai / totalTugas) * 100) : 0;

      const rataRataNilai = await this.calculateRataRataNilai(nomorInduk);
      const sks = mataKuliahList.reduce((sum, mk) => sum + (mk.sks || 0), 0);

      return {
        progress: {
          persentase,
          tugasSelesai,
          totalTugas,
          perMataKuliah: tugasData.perCourse || [],
        },
        rataRataNilai,
        sks,
        mataKuliah: mataKuliahList.slice(0, 5).map((mk) => ({
          id: mk.idMataKuliah,
          nama: mk.namaMataKuliah,
          guruNama: mk.guru?.user?.nama || "-",
          jadwal: mk.jadwal || "",
          waktu: mk.waktu || "-",
        })),
        jadwal: jadwalData,
        threads: threads.map((t) => ({
          id: t.idForumDiskusi,
          judul: t.judul,
          authorName: t.user?.nama || "Unknown",
        })),
      };
    } catch (error) {
      console.error("Dashboard error:", error);
      throw new Error("Dashboard data gagal dimuat: " + error.message);
    }
  }

  async calculateRataRataNilai(nomorInduk) {
    try {
      const nilaiRecords = await this.prisma.nilai.findMany({
        where: { nomorInduk },
        include: { mataKuliah: true },
      });

      if (nilaiRecords.length === 0) return 0;

      let totalNilai = 0;
      let count = 0;
      for (const n of nilaiRecords) {
        const semester = n.mataKuliah?.semester || n.semester;
        if (!semester || semester > 3) continue;

        const tugas = n.nilaiTugas ? parseFloat(n.nilaiTugas) : null;
        const kuis = n.nilaiKuis ? parseFloat(n.nilaiKuis) : null;
        let score = null;
        if (tugas !== null && kuis !== null) {
          score = Math.round(tugas * 0.5 + kuis * 0.5);
        }
        if (score !== null && !isNaN(score)) {
          totalNilai += score;
          count++;
        }
      }

      return count > 0 ? Math.round((totalNilai / count) * 10) / 10 : 0;
    } catch (error) {
      console.error("calculateRataRataNilai error:", error);
      return 0;
    }
  }

  async getJadwalMataKuliah(mataKuliahList, hariDariClient) {
    const daysMap = {
      minggu: 0,
      senin: 1,
      selasa: 2,
      rabu: 3,
      kamis: 4,
      jumat: 5,
      sabtu: 6,
    };

    // PAKSA gunakan hari dari client, jangan pakai server time
    let todayName = hariDariClient ? hariDariClient.toLowerCase().trim() : null;
    if (!todayName) {
      const todayIndex = new Date().getDay();
      todayName = Object.keys(daysMap).find((k) => daysMap[k] === todayIndex);
    }

    if (!todayName) return [];

    const jadwalList = [];

    for (const mk of mataKuliahList) {
      if (!mk.jadwal) continue;
      const hariList = mk.jadwal.split(",").map((h) => h.trim().toLowerCase());
      if (hariList.includes(todayName)) {
        // Capitalize first letter untuk tampilan
        const hariDisplay = todayName.charAt(0).toUpperCase() + todayName.slice(1);
        jadwalList.push({
          mataKuliah: mk.namaMataKuliah,
          guru: mk.guru?.user?.nama || "-",
          hari: hariDisplay,
          waktu: mk.waktu || "-",
        });
      }
    }

    return jadwalList;
  }

  async getTugasProgress(actualNis, mataKuliahList) {
    try {
      const idMkList = mataKuliahList.map((mk) => mk.idMataKuliah);

      // Ambil semua tugas dari mata kuliah yang diambil siswa + cek pengumpulan
      // FILTER BY NIS untuk menghindari duplicate (satu tugas dibuat untuk semua siswa)
      const allTugas = await this.prisma.tugas.findMany({
        where: { 
          idMataKuliah: { in: idMkList },
          nis: actualNis  // Hanya tugas milik siswa ini
        },
        include: {
          pengumpulanTugas: {
            where: { nis: actualNis },
          },
        },
      });

      // Ambil semua kuis dari mata kuliah yang diambil siswa
      const allKuis = await this.prisma.kuis.findMany({
        where: { idMataKuliah: { in: idMkList } },
        include: {
          jawabanKuis: {
            where: { nis: actualNis },
          },
        },
      });

      // Total = tugas + kuis
      const totalTugas = allTugas.length;
      const totalKuis = allKuis.length;
      const total = totalTugas + totalKuis;
      
      if (total === 0) return { total: 0, selesai: 0, perCourse: [] };

      // Hitung selesai tugas (ada pengumpulan)
      let tugasSelesai = 0;
      for (const t of allTugas) {
        if (t.pengumpulanTugas && t.pengumpulanTugas.length > 0) {
          tugasSelesai++;
        }
      }

      // Hitung selesai kuis (ada jawaban)
      let kuisSelesai = 0;
      for (const k of allKuis) {
        if (k.jawabanKuis && k.jawabanKuis.length > 0) {
          kuisSelesai++;
        }
      }

      const selesai = tugasSelesai + kuisSelesai;

      // Hitung per mata kuliah (tugas + kuis)
      const courseMap = new Map();
      for (const t of allTugas) {
        if (!courseMap.has(t.idMataKuliah)) {
          courseMap.set(t.idMataKuliah, { total: 0, selesai: 0 });
        }
        const c = courseMap.get(t.idMataKuliah);
        c.total++;
        if (t.pengumpulanTugas && t.pengumpulanTugas.length > 0) {
          c.selesai++;
        }
      }
      for (const k of allKuis) {
        if (!courseMap.has(k.idMataKuliah)) {
          courseMap.set(k.idMataKuliah, { total: 0, selesai: 0 });
        }
        const c = courseMap.get(k.idMataKuliah);
        c.total++;
        if (k.jawabanKuis && k.jawabanKuis.length > 0) {
          c.selesai++;
        }
      }

      const perCourse = mataKuliahList
        .filter((mk) => courseMap.has(mk.idMataKuliah))
        .map((mk) => {
          const c = courseMap.get(mk.idMataKuliah);
          return {
            idMataKuliah: mk.idMataKuliah,
            nama: mk.namaMataKuliah,
            total: c.total,
            selesai: c.selesai,
            persentase:
              c.total > 0 ? Math.round((c.selesai / c.total) * 100) : 0,
          };
        });

      return { total, selesai, perCourse };
    } catch (error) {
      console.error("getTugasProgress error:", error);
      return { total: 0, selesai: 0, perCourse: [] };
    }
  }
}
