import express from 'express';
import { KelompokController } from '../controllers/KelompokController.js';
import { KelompokUseCase } from '../../usecases/KelompokUseCase.js';
import { PrismaKelompokRepository } from '../../infrastucture/repositories/PrismaKelompokRepository.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Dependency Injection
const repository = new PrismaKelompokRepository();
const useCase = new KelompokUseCase(repository);
const controller = new KelompokController(useCase);

// Semua rute kelompok diamankan dengan token
router.use(authMiddleware);

router.get('/siswa/all', (req, res) => controller.getSiswa(req, res));
router.get('/', (req, res) => controller.getAllKelompok(req, res));
router.get('/:idMataKuliah', (req, res) => controller.getKelompok(req, res));
router.post('/', (req, res) => controller.createKelompok(req, res));
router.post('/:idKelompok/members', (req, res) => controller.addMember(req, res));
router.delete('/:idKelompok/members/:nis', (req, res) => controller.removeMember(req, res));
router.put('/:idKelompok/grades', (req, res) => controller.saveGrades(req, res));
router.delete('/:idKelompok', (req, res) => controller.deleteKelompok(req, res));

export default router;