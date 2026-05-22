import express from 'express';
import { MataKuliahController } from '../controllers/MataKuliahController.js';
import { MataKuliahUseCase } from '../../usecases/MataKuliahUseCase.js';
import { PrismaMataKuliahRepository } from '../../infrastucture/repositories/PrismaMataKuliahReposiory.js';

const router = express.Router();

const repo = new PrismaMataKuliahRepository();
const useCase = new MataKuliahUseCase(repo);
const controller = new MataKuliahController(useCase);

router.get('/', (req, res) => controller.getAll(req, res));
router.get('/siswa/me', (req, res) => controller.getMine(req, res));
router.get('/:id', (req, res) => controller.getOne(req, res));
router.get('/:idMataKuliah/detail', (req, res) => controller.getDetail(req, res));
router.post('/', (req, res) => controller.create(req, res));
router.patch('/:id', (req, res) => controller.update(req, res));
router.delete('/:id', (req, res) => controller.delete(req, res));

export default router;