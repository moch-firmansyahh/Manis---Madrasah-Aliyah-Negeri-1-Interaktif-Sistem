import express from 'express';
import { PrismaGuruProfileRepository } from '../../infrastucture/repositories/PrismaGuruProfileRepository.js';
import { GuruProfileUseCase } from '../../usecases/GuruProfileUseCase.js';
import { GuruProfileController } from '../controllers/GuruProfileController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

const repository = new PrismaGuruProfileRepository();
const useCase = new GuruProfileUseCase(repository);
const controller = new GuruProfileController(useCase);

// Semua route di bawah authMiddleware wajib menyertakan header otorisasi [cite: 627]
router.use(authMiddleware);

router.get('/profile', (req, res) => controller.getProfile(req, res));
router.put('/profile', (req, res) => controller.updateProfile(req, res));
router.post('/profile/change-password', (req, res) => controller.changePassword(req, res));

export default router;