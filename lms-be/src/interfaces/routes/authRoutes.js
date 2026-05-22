import express from 'express';
import { PrismaUserRepository } from '../../infrastucture/repositories/PrismaUserRepository.js';
import { AuthUseCase } from '../../usecases/AuthUseCase.js';
import { AuthController } from '../controllers/AuthController.js';

const router = express.Router();
const userRepo = new PrismaUserRepository();
const authUseCase = new AuthUseCase(userRepo);
const controller = new AuthController(authUseCase);

router.post('/login', (req, res) => controller.login(req, res));

export default router;