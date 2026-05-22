import express from 'express';
import { PrismaForumGuruRepository } from '../../infrastucture/repositories/PrismaForumGuruRepository.js';
import { GuruForumUseCase } from '../../usecases/GuruForumUseCase.js';
import { GuruForumController } from '../controllers/GuruForumController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

// Setup file upload (opsional, jika Anda menggunakan multer)
// import multer from 'multer';
// const upload = multer({ dest: 'uploads/' }); 

const router = express.Router();
const repository = new PrismaForumGuruRepository();
const useCase = new GuruForumUseCase(repository);
const controller = new GuruForumController(useCase);

router.use(authMiddleware);

router.get('/mata-kuliah/:idMataKuliah', (req, res) => controller.getThreads(req, res));
router.post('/', /* upload.single('lampiran'), */ (req, res) => controller.createThread(req, res));
router.post('/:idForum/reply', (req, res) => controller.addReply(req, res));
router.post('/:idForum/like', (req, res) => controller.toggleLike(req, res));

export default router;