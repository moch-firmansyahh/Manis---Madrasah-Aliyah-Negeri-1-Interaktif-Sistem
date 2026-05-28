import express from 'express';
import { PrismaPresensiGuruRepository } from '../../infrastucture/repositories/PrismaPresensiGuruRepository.js';
import { PresensiGuruUseCase } from '../../usecases/PresensiGuruUseCase.js';
import { PresensiGuruController } from '../controllers/PresensiGuruController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { prisma } from '../../prismaClient.js';

// Helper untuk normalisasi tanggal ke UTC
function normalizeDateToUTC(date) {
    const d = new Date(date);
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0));
}

const router = express.Router();

// Dependency Injection
const repository = new PrismaPresensiGuruRepository();
const usecase = new PresensiGuruUseCase(repository);
const controller = new PresensiGuruController(usecase);

// Semua rute presensi dilindungi middleware
router.use(authMiddleware);

router.get('/matkul/:idMataKuliah/daftar-hadir', (req, res) => controller.getDaftarHadir(req, res));
router.put('/:idPresensi/status', (req, res) => controller.updateStatus(req, res));
router.put('/nis/:nis/matkul/:idMataKuliah/status', (req, res) => controller.updateStatusByNis(req, res));

/**
 * POST /api/guru/presensi/matkul/:idMataKuliah/generate
 * Guru membuat sesi presensi baru untuk tanggal tertentu
 */
router.post('/matkul/:idMataKuliah/generate', async (req, res) => {
  try {
    const { idMataKuliah } = req.params;
    const { tanggal } = req.body;
    
    // Use provided date or current timestamp
    let targetDate = new Date();
    if (tanggal) {
      // Create date and set to noon UTC to prevent timezone shifts when saving
      targetDate = new Date(`${tanggal}T12:00:00.000Z`);
    } else {
      // Shift to WIB (+7 hours) to determine the correct calendar day local to MAN 1 Sumedang, then set UTC to 12:00
      const localWIB = new Date(Date.now() + 7 * 60 * 60 * 1000);
      targetDate = new Date(Date.UTC(localWIB.getUTCFullYear(), localWIB.getUTCMonth(), localWIB.getUTCDate(), 12, 0, 0, 0));
    }
    
    // Ambil detail mata kuliah untuk mendapatkan idKelas
    const course = await prisma.mataKuliah.findUnique({
      where: { idMataKuliah: parseInt(idMataKuliah) }
    });

    if (!course) {
      return res.status(404).json({ error: 'Mata kuliah tidak ditemukan' });
    }

    // Ambil hanya siswa yang terdaftar di kelas mata kuliah ini
    const siswaList = await prisma.siswa.findMany({
      where: { idKelas: course.idKelas }
    });

    if (siswaList.length === 0) {
      return res.status(400).json({ error: 'Tidak ada siswa terdaftar di kelas mata pelajaran ini' });
    }

    // Generate token QR unik
    const token = `Manis-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Cek apakah sudah ada sesi untuk tanggal yang sama (gunakan UTC)
    const targetDateNormalized = normalizeDateToUTC(targetDate);
    const startOfDay = new Date(Date.UTC(targetDateNormalized.getUTCFullYear(), targetDateNormalized.getUTCMonth(), targetDateNormalized.getUTCDate(), 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(targetDateNormalized.getUTCFullYear(), targetDateNormalized.getUTCMonth(), targetDateNormalized.getUTCDate(), 23, 59, 59, 999));

    const existingSession = await prisma.presensi.findFirst({
      where: {
        idMataKuliah: parseInt(idMataKuliah),
        tanggalPertemuan: {
          gte: startOfDay,
          lt: endOfDay
        }
      }
    });

    if (existingSession) {
      // Sesi sudah ada, generate token baru dan return success
      const newToken = `Manis-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      return res.status(200).json({
        message: `Sesi presensi untuk tanggal ${targetDate.toISOString().split('T')[0]} sudah ada`,
        token: newToken,
        tanggal: targetDate.toISOString(),
        existing: true
      });
    }

    // Buat sesi presensi untuk setiap siswa pada tanggal tersebut
    // Cek dulu per siswa - hanya buat kalau belum ada untuk tanggal ini
    const sessionTime = normalizeDateToUTC(targetDate);
    
    const createdRecords = await Promise.allSettled(
      siswaList.map(async m => {
        const existing = await prisma.presensi.findFirst({
          where: {
            nis: m.nis,
            idMataKuliah: parseInt(idMataKuliah),
            tanggalPertemuan: { gte: startOfDay, lt: endOfDay }
          }
        });
        if (existing) return existing; // Sudah ada, skip
        return prisma.presensi.create({
          data: {
            nis: m.nis,
            idMataKuliah: parseInt(idMataKuliah),
            statusKehadiran: 'Alpha',
            tanggalPertemuan: sessionTime
          }
        });
      })
    );

    const successCount = createdRecords.filter(r => r.status === 'fulfilled').length;

    res.status(201).json({
      message: `Sesi presensi berhasil dibuat untuk ${successCount} siswa`,
      token,
      tanggal: sessionTime.toISOString()
    });
  } catch (error) {
    console.error('Generate presensi error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get daftar hadir untuk tanggal tertentu
router.get('/daftar-hadir/:idMataKuliah/:tanggal', authMiddleware, async (req, res) => {
  try {
    const { idMataKuliah, tanggal } = req.params;
    const data = await repository.getDaftarHadirByTanggal(idMataKuliah, tanggal);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Get daftar hadir by tanggal error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get semua tanggal presensi yang tersedia
router.get('/dates/:idMataKuliah', authMiddleware, async (req, res) => {
  try {
    const { idMataKuliah } = req.params;
    const dates = await repository.getAllPresensiDates(idMataKuliah);
    res.status(200).json({ success: true, dates });
  } catch (error) {
    console.error('Get all dates error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;