import { prisma } from "../../prismaClient.js";

// Helper untuk mendapatkan start/end of day dalam UTC
function getStartOfDayUTC() {
    const now = new Date();
    const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0));
    return d;
}

function getEndOfDayUTC() {
    const now = new Date();
    const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999));
    return d;
}

export class PrismaPresensiGuruRepository {
    async getSiswaByMatkul(idMataKuliah) {
        
        const mataKuliah = await prisma.mataKuliah.findUnique({
            where: { idMataKuliah: parseInt(idMataKuliah) },
            include: {
                nilai: { include: { user: true } },
                presensi: { include: { siswa: { include: { user: true } } } },
                kelompok: { include: { anggota: { include: { siswa: { include: { user: true } } } } } },
                tugas: { include: { siswa: { include: { user: true } } } }
            }
        });

        const siswaMap = new Map();
        const nomorIndukSet = new Set();
        
        mataKuliah?.nilai?.forEach(n => { if (n.nomorInduk) nomorIndukSet.add(n.nomorInduk); });
        mataKuliah?.presensi?.forEach(p => { if (p.siswa) siswaMap.set(p.siswa.nis, p.siswa); });
        mataKuliah?.kelompok?.forEach(k => { k.anggota?.forEach(a => { if (a.siswa) siswaMap.set(a.siswa.nis, a.siswa); }); });
        mataKuliah?.tugas?.forEach(t => { if (t.siswa) siswaMap.set(t.siswa.nis, t.siswa); });

        if (nomorIndukSet.size > 0) {
            const siswaFromNilai = await prisma.siswa.findMany({
                where: { nomorInduk: { in: Array.from(nomorIndukSet) } },
                include: { user: true }
            });
            siswaFromNilai.forEach(m => siswaMap.set(m.nis, m));
        }

        if (siswaMap.size === 0) {
            const allSiswa = await prisma.siswa.findMany({ include: { user: true } });
            allSiswa.forEach(m => siswaMap.set(m.nis, m));
        }

        const siswaList = Array.from(siswaMap.values());
        const today = getStartOfDayUTC();
        const tomorrow = getEndOfDayUTC();
        
        const result = await Promise.all(siswaList.map(async (mhs, index) => {
            const presensiTerbaru = await prisma.presensi.findFirst({
                where: { nis: mhs.nis, idMataKuliah: parseInt(idMataKuliah), tanggalPertemuan: { gte: today, lt: tomorrow } },
                orderBy: { tanggalPertemuan: 'desc' }
            });

            const nama = mhs.user?.nama || 'Unknown';
            const initials = nama.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
            const statusUI = presensiTerbaru?.statusKehadiran === "Alpha" ? "Alpa" : (presensiTerbaru?.statusKehadiran || "Alpa");
            const colors = ["#8991fe", "#f59e0b", "#10b981", "#ec4899", "#6366f1", "#2f9696"];
            
            return {
                id: presensiTerbaru?.idPresensi || `mhs-${mhs.nis}`,
                nis: mhs.nis, name: nama, initials, color: colors[index % colors.length], status: statusUI,
                tanggalPertemuan: presensiTerbaru?.tanggalPertemuan || null,
                waktuPresensi: presensiTerbaru?.waktuPresensi || null
            };
        }));

        return result.sort((a, b) => a.nis.localeCompare(b.nis));
    }

    async updateStatusPresensi(idPresensi, statusKehadiran) {
        const statusDB = statusKehadiran === "Alpa" ? "Alpha" : statusKehadiran;
        return await prisma.presensi.update({
            where: { idPresensi: parseInt(idPresensi) },
            data: { statusKehadiran: statusDB, waktuPresensi: new Date() }
        });
    }

    async updateStatusByNis(nis, idMataKuliah, statusKehadiran) {
        const statusDB = statusKehadiran === "Alpa" ? "Alpha" : statusKehadiran;
        const today = getStartOfDayUTC();
        const tomorrow = getEndOfDayUTC();

        let presensiHariIni = await prisma.presensi.findFirst({
            where: { nis, idMataKuliah: parseInt(idMataKuliah), tanggalPertemuan: { gte: today, lt: tomorrow } }
        });

        if (presensiHariIni) {
            return await prisma.presensi.update({
                where: { idPresensi: presensiHariIni.idPresensi },
                data: { statusKehadiran: statusDB, waktuPresensi: new Date() }
            });
        } else {
            return await prisma.presensi.create({
                data: { nis, idMataKuliah: parseInt(idMataKuliah), tanggalPertemuan: today, waktuPresensi: new Date(), statusKehadiran: statusDB }
            });
        }
    }

    async getAllPresensiDates(idMataKuliah) {
        const presensiList = await prisma.presensi.findMany({
            where: { idMataKuliah: parseInt(idMataKuliah) },
            select: { tanggalPertemuan: true },
            distinct: ['tanggalPertemuan'],
            orderBy: { tanggalPertemuan: 'desc' }
        });
        return presensiList.map(p => p.tanggalPertemuan);
    }

    async getDaftarHadirByTanggal(idMataKuliah, tanggal) {
        const targetDate = new Date(tanggal);
        const startOfDay = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate(), 0, 0, 0, 0));
        const endOfDay = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate(), 23, 59, 59, 999));
        
        const allSiswa = await prisma.siswa.findMany({ include: { user: true } });
        const presensiList = await prisma.presensi.findMany({
            where: { idMataKuliah: parseInt(idMataKuliah), tanggalPertemuan: { gte: startOfDay, lte: endOfDay } }
        });
        // Untuk setiap NIS, ambil yang statusnya "Hadir" jika ada, kalau tidak ambil yang terbaru
        const presensiMap = new Map();
        presensiList.forEach(p => {
            const existing = presensiMap.get(p.nis);
            if (!existing) {
                presensiMap.set(p.nis, p);
            } else if (p.statusKehadiran === 'Hadir') {
                // Prioritaskan yang Hadir
                presensiMap.set(p.nis, p);
            } else if (existing.statusKehadiran !== 'Hadir' && p.waktuPresensi > existing.waktuPresensi) {
                // Kalau keduanya bukan Hadir, ambil yang paling baru
                presensiMap.set(p.nis, p);
            }
        });
        
        const colors = ["#8991fe", "#f59e0b", "#10b981", "#ec4899", "#6366f1", "#2f9696"];
        
        return allSiswa.map((mhs, index) => {
            const presensi = presensiMap.get(mhs.nis);
            const nama = mhs.user?.nama || 'Unknown';
            const initials = nama.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
            const statusUI = presensi?.statusKehadiran === "Alpha" ? "Alpa" : (presensi?.statusKehadiran || "Alpa");
            
            return {
                id: presensi?.idPresensi || `mhs-${mhs.nis}`,
                nis: mhs.nis, name: nama, initials, color: colors[index % colors.length], status: statusUI,
                tanggalPertemuan: presensi?.tanggalPertemuan || null,
                waktuPresensi: presensi?.waktuPresensi || null
            };
        });
    }
}
