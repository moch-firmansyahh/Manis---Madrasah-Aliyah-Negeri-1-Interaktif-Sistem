import { prisma } from "../../prismaClient.js";

// Helper untuk mendapatkan start/end of day dalam UTC dengan offset WIB (+7 jam)
function getStartOfDayUTC() {
  const localWIB = new Date(Date.now() + 7 * 60 * 60 * 1000);
  return new Date(
    Date.UTC(
      localWIB.getUTCFullYear(),
      localWIB.getUTCMonth(),
      localWIB.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  );
}

function getEndOfDayUTC() {
  const localWIB = new Date(Date.now() + 7 * 60 * 60 * 1000);
  return new Date(
    Date.UTC(
      localWIB.getUTCFullYear(),
      localWIB.getUTCMonth(),
      localWIB.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  );
}

export class PrismaPresensiRepository {
  async getDaftarHadirSiswa(idMataKuliah) {
    const mataKuliah = await prisma.mataKuliah.findUnique({
      where: { idMataKuliah: idMataKuliah },
      include: {
        nilai: {
          include: {
            siswa: {
              include: {
                user: { select: { nama: true } },
              },
            },
          },
        },
        presensi: {
          include: {
            siswa: {
              include: {
                user: { select: { nama: true } },
              },
            },
          },
        },
        kelompok: {
          include: {
            anggota: {
              include: {
                siswa: {
                  include: {
                    user: { select: { nama: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    const siswaMap = new Map();

    mataKuliah?.nilai?.forEach((n) => {
      if (n.siswa) {
        siswaMap.set(n.siswa.nis, n.siswa);
      }
    });

    mataKuliah?.presensi?.forEach((p) => {
      if (p.siswa) {
        siswaMap.set(p.siswa.nis, p.siswa);
      }
    });

    mataKuliah?.kelompok?.forEach((k) => {
      k.anggota?.forEach((a) => {
        if (a.siswa) {
          siswaMap.set(a.siswa.nis, a.siswa);
        }
      });
    });

    if (siswaMap.size === 0) {
      const allSiswa = await prisma.siswa.findMany({
        include: { user: { select: { nama: true } } },
      });
      allSiswa.forEach((m) => {
        siswaMap.set(m.nis, m);
      });
    }

    const today = getStartOfDayUTC();
    const tomorrow = getEndOfDayUTC();

    const siswaList = Array.from(siswaMap.values());

    const result = await Promise.all(
      siswaList.map(async (mhs, index) => {
        const presensiTerbaru = await prisma.presensi.findFirst({
          where: {
            nis: mhs.nis,
            idMataKuliah: idMataKuliah,
            tanggalPertemuan: {
              gte: today,
              lt: tomorrow,
            },
          },
          orderBy: { tanggalPertemuan: "desc" },
        });

        const initials = mhs.user?.nama?.substring(0, 2).toUpperCase() || "NA";

        const colors = ["#8991fe", "#f59e0b", "#10b981", "#ec4899", "#6366f1"];
        const randomColor = colors[index % colors.length];

        return {
          id: presensiTerbaru?.idPresensi || `${mhs.nis}-${Date.now()}`,
          nis: mhs.nis,
          name: mhs.user?.nama || "Unknown",
          initials: initials,
          color: randomColor,
          status: presensiTerbaru?.statusKehadiran || "Alpa",
          tanggalPertemuan: presensiTerbaru?.tanggalPertemuan || null,
          waktuPresensi: presensiTerbaru?.waktuPresensi || null,
        };
      }),
    );

    return result.sort((a, b) => a.nis.localeCompare(b.nis));
  }

  async updateStatus(idPresensi, statusKehadiran) {
    return await prisma.presensi.update({
      where: { idPresensi: idPresensi },
      data: { statusKehadiran: statusKehadiran },
    });
  }

  async updateStatusByNis(nis, idMataKuliah, statusKehadiran) {
    const today = getStartOfDayUTC();
    const tomorrow = getEndOfDayUTC();

    let presensiHariIni = await prisma.presensi.findFirst({
      where: {
        nis: nis,
        idMataKuliah: idMataKuliah,
        tanggalPertemuan: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    if (presensiHariIni) {
      return await prisma.presensi.update({
        where: { idPresensi: presensiHariIni.idPresensi },
        data: {
          statusKehadiran: statusKehadiran,
          waktuPresensi: new Date(),
        },
      });
    } else {
      return await prisma.presensi.create({
        data: {
          nis: nis,
          idMataKuliah: idMataKuliah,
          tanggalPertemuan: today,
          waktuPresensi: new Date(),
          statusKehadiran: statusKehadiran,
        },
      });
    }
  }

  async markAsHadir(nis, idMataKuliah, tokenScan) {
    const siswa = await prisma.siswa.findUnique({
      where: { nis: nis },
    });

    if (!siswa) {
      throw new Error("Data siswa tidak ditemukan. Silakan login ulang.");
    }

    const today = getStartOfDayUTC();
    const tomorrow = getEndOfDayUTC();

    let presensiSesiIni = await prisma.presensi.findFirst({
      where: {
        nis: nis,
        idMataKuliah: idMataKuliah,
        tanggalPertemuan: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: {
        tanggalPertemuan: "desc",
      },
    });

    if (!presensiSesiIni) {
      presensiSesiIni = await prisma.presensi.create({
        data: {
          nis: nis,
          idMataKuliah: idMataKuliah,
          tanggalPertemuan: today,
          waktuPresensi: new Date(),
          statusKehadiran: "Hadir",
        },
      });
      return { message: "Absen berhasil!", presensi: presensiSesiIni };
    }

    const updated = await prisma.presensi.update({
      where: { idPresensi: presensiSesiIni.idPresensi },
      data: {
        statusKehadiran: "Hadir",
        waktuPresensi: new Date(),
      },
    });
    return updated;
  }

  async getRiwayatKehadiran(nis, idMataKuliah) {
    return await prisma.presensi.findMany({
      where: { nis, idMataKuliah },
      orderBy: { tanggalPertemuan: "desc" },
    });
  }

  async buatSesiPresensi(idMataKuliah) {
    const semuaSiswa = await prisma.siswa.findMany();

    if (semuaSiswa.length === 0) {
      throw new Error("Tidak ada siswa yang terdaftar");
    }

    const today = getStartOfDayUTC();
    const tomorrow = getEndOfDayUTC();

    const existingSession = await prisma.presensi.findFirst({
      where: {
        idMataKuliah: idMataKuliah,
        tanggalPertemuan: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    if (existingSession) {
      return { message: "Sesi sudah ada untuk hari ini" };
    }

    const createMany = semuaSiswa.map((m) => ({
      nis: m.nis,
      idMataKuliah: idMataKuliah,
      tanggalPertemuan: today,
      statusKehadiran: "Alpha",
    }));

    await prisma.presensi.createMany({
      data: createMany,
    });

    return {
      message: "Sesi presensi berhasil dibuat",
      count: semuaSiswa.length,
    };
  }
}
