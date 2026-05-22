import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { PrismaPresensiRepository } from '../../infrastucture/repositories/PrismaPresensiRepository.js';
import { PresensiUseCase } from '../../usecases/PresensiUseCase.js';
import { PresensiController } from '../controllers/PresensiController.js';

const router = express.Router();
const presensiRepo = new PrismaPresensiRepository();
const presensiUseCase = new PresensiUseCase(presensiRepo, null);
const controller = new PresensiController(presensiUseCase);

// Lindungi rute dengan token JWT
router.use(authMiddleware);

// Rute untuk Guru
router.get('/mata-kuliah/:idMataKuliah', (req, res) => controller.getDaftarHadir(req, res));

// Rute untuk Siswa
router.post('/scan', (req, res) => controller.scanQR(req, res));
router.get('/siswa/:idMataKuliah', (req, res) => controller.getPresensiSiswa(req, res));
router.get('/summary/:idMataKuliah', (req, res) => controller.getSummaryPresensi(req, res));

export default router;