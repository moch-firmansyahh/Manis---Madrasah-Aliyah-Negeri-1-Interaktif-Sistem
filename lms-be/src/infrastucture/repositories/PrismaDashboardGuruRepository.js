import { prisma } from "../../prismaClient.js";
export class PrismaDashboardGuruRepository {
  async getGuruInfo(nomorInduk) {
    return await prisma.guru.findUnique({
      where: { nomorInduk },
      include: {
        user: true,
      }
    });
  }

  async getPendingTasks(nipGuru) {
    try {
      return await prisma.pengumpulanTugas.findMany({
        where: {
          tugas: {
            mataKuliah: {
              nipGuru: nipGuru
            }
          }
        },
        include: {
          tugas: { include: { mataKuliah: true } },
          siswa: { include: { user: true } },
          kelompok: true
        },
        orderBy: { deadlineTugas: 'asc' },
        take: 5
      });
    } catch (error) {
      console.error("getPendingTasks error:", error.message);
      return [];
    }
  }

  async getSchedule(nipGuru) {
    try {
      return await prisma.mataKuliah.findMany({
        where: { nipGuru: nipGuru },
        take: 5
      });
    } catch (error) {
      console.error("getSchedule error:", error.message);
      return [];
    }
  }

  async getTotalSiswa(nipGuru, idKelas = null) {
    try {
      if (idKelas) {
        return await prisma.siswa.count({
          where: { idKelas: parseInt(idKelas) }
        });
      }
      const classes = await prisma.mataKuliah.findMany({
        where: { nipGuru },
        select: { idKelas: true },
        distinct: ['idKelas']
      });
      const classIds = classes.map(c => c.idKelas).filter(Boolean);
      return await prisma.siswa.count({
        where: { idKelas: { in: classIds } }
      });
    } catch (error) {
      console.error("getTotalSiswa error:", error.message);
      return 0;
    }
  }

  async getMateriList(nipGuru, idKelas = null) {
    try {
      const mkFilter = { nipGuru };
      if (idKelas) mkFilter.idKelas = idKelas;
      return await prisma.modulAjar.findMany({
        where: { mataKuliah: mkFilter },
        include: { mataKuliah: true },
        orderBy: { tanggal: 'desc' },
        take: 10
      });
    } catch (error) {
      console.error("getMateriList error:", error.message);
      return [];
    }
  }

  async getSubmissionStats(nipGuru, idKelas = null) {
    try {
      const mkFilter = { nipGuru };
      if (idKelas) mkFilter.idKelas = idKelas;
      const allSubmissions = await prisma.pengumpulanTugas.findMany({
        where: {
          tugas: {
            mataKuliah: mkFilter
          }
        },
        include: {
          kelompok: true
        }
      });

      const individu = allSubmissions.filter(s => !s.kelompok).length;
      const kelompok = allSubmissions.filter(s => s.kelompok).length;

      return { individu, kelompok };
    } catch (error) {
      console.error("getSubmissionStats error:", error.message);
      return { individu: 0, kelompok: 0 };
    }
  }
}