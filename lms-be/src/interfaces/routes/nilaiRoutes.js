import express from 'express';
import { NilaiController } from '../controllers/NilaiController.js';
import { NilaiUseCase } from '../../usecases/NilaiUseCase.js';
import { PrismaNilaiRepository } from '../../infrastucture/repositories/PrismaNilaiRepository.js';
import { GetTranskripUsecase } from '../../usecases/GetTranskripUsecase.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();
const repo = new PrismaNilaiRepository();
const nilaiUseCase = new NilaiUseCase(repo);
const transkripUseCase = new GetTranskripUsecase(repo);
const controller = new NilaiController(nilaiUseCase, transkripUseCase);

router.post('/', (req, res) => controller.create(req, res));
router.get('/', authMiddleware, (req, res) => controller.getAll(req, res));
router.get('/mata-kuliah/:idMataKuliah', authMiddleware, (req, res) => controller.getByMataKuliah(req, res));
router.get('/transkrip/siswa', authMiddleware, (req, res) => controller.getTranskrip(req, res));
router.get('/siswa/:idMataKuliah', (req, res) => controller.getBySiswa(req, res));
router.patch('/:id', (req, res) => controller.update(req, res));

router.get('/submissions/individu/:idMataKuliah', authMiddleware, (req, res) => controller.getPengumpulanIndividu(req, res));
router.get('/submissions/tugas/:idTugas', authMiddleware, (req, res) => controller.getPengumpulanPerTugas(req, res));
router.get('/tugas-list/:idMataKuliah', authMiddleware, (req, res) => controller.getTugasByMataKuliah(req, res));
router.post('/submissions/nilai', authMiddleware, (req, res) => controller.saveNilaiTugas(req, res));

export default router;