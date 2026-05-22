import express from 'express';
import { PrismaDashboardGuruRepository } from '../../infrastucture/repositories/PrismaDashboardGuruRepository.js';
import { DashboardGuruUseCase } from '../../usecases/DashboardGuruUseCase.js';
import { DashboardGuruController } from '../controllers/DashboardGuruController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js'; // Pastikan path sesuai

const router = express.Router();

// Dependency Injection
const repository = new PrismaDashboardGuruRepository();
const useCase = new DashboardGuruUseCase(repository);
const controller = new DashboardGuruController(useCase);

// Endpoint Terlindungi: Hanya Guru yang login yang bisa akses
router.get('/', authMiddleware, controller.getDashboard);

export default router;