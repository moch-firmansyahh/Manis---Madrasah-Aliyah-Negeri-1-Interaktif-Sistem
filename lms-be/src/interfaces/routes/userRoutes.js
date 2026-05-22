import express from 'express';
import { UserController } from '../controllers/UserController.js';
import { UserUseCase } from '../../usecases/UserUseCase.js';
import { PrismaUserRepository } from '../../infrastucture/repositories/PrismaUserRepository.js';

const router = express.Router();

// Dependency Injection (Menyusun lapisan)
const userRepository = new PrismaUserRepository();
const userUseCase = new UserUseCase(userRepository);
const userController = new UserController(userUseCase);

router.post('/users', (req, res) => userController.createUser(req, res));
router.get('/users', (req, res) => userController.getUsers(req, res));
router.patch('/users/:nomorInduk', (req, res) => userController.update(req, res));
router.delete('/users/:nomorInduk', (req, res) => userController.delete(req, res));

export default router;