import express from 'express';
import { PrismaForumRepository } from '../../infrastucture/repositories/PrismaForumRepository.js';
import { ForumUseCase } from '../../usecases/ForumUseCase.js';
import { ForumController } from '../controllers/ForumController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();
const forumRepo = new PrismaForumRepository();
const forumUseCase = new ForumUseCase(forumRepo);
const controller = new ForumController(forumUseCase);

router.get('/mata-kuliah/:idMataKuliah', authMiddleware, (req, res) => controller.getThreads(req, res));
router.get('/comment/:idKomentar', (req, res) => controller.getCommentById(req, res));
router.post('/thread', authMiddleware, (req, res) => controller.createThread(req, res));
router.put('/thread/:idForumDiskusi', authMiddleware, (req, res) => controller.updateThread(req, res));
router.delete('/thread/:idForumDiskusi', authMiddleware, (req, res) => controller.deleteThread(req, res));
router.post('/comment', authMiddleware, (req, res) => controller.addComment(req, res));
router.put('/comment/:idKomentar', authMiddleware, (req, res) => controller.updateComment(req, res));
router.delete('/comment/:idKomentar', authMiddleware, (req, res) => controller.deleteComment(req, res));
router.post('/like', authMiddleware, (req, res) => controller.toggleLike(req, res));

export default router;