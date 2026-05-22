import express from 'express';
import { DashboardSiswaUseCase } from '../../usecases/DashboardSiswaUseCase.js';
import { DashboardController } from '../controllers/DashboardController.js';
import { PrismaMataKuliahRepository } from '../../infrastucture/repositories/PrismaMataKuliahReposiory.js';
import { PrismaForumRepository } from '../../infrastucture/repositories/PrismaForumRepository.js';
import { prisma } from '../../prismaClient.js';

const router = express.Router();
const mataKuliahRepo = new PrismaMataKuliahRepository();
const forumRepo = new PrismaForumRepository();
const dashboardUseCase = new DashboardSiswaUseCase(mataKuliahRepo, forumRepo, prisma);
const dashboardController = new DashboardController(dashboardUseCase);

router.get('/siswa', (req, res) => dashboardController.getSiswaDashboard(req, res));

export default router;