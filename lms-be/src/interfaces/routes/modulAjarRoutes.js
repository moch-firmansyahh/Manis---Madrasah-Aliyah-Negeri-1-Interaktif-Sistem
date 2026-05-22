import express from 'express';
import multer from 'multer';
import { ModulAjarController } from '../controllers/ModulAjarController.js';
import { ModulAjarUseCase } from '../../usecases/ModulAjarUseCase.js';
import { PrismaModulAjarRepository } from '../../infrastucture/repositories/PrismaModulAjarRepository.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

// Setup Multer untuk upload file
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

const router = express.Router();
const repository = new PrismaModulAjarRepository();
const useCase = new ModulAjarUseCase(repository);
const controller = new ModulAjarController(useCase);

router.use(authMiddleware);

router.get('/', (req, res) => controller.getAll(req, res));
router.post('/', upload.single('file'), (req, res) => controller.create(req, res));
router.put('/:id', (req, res) => controller.update(req, res));
router.delete('/:id', (req, res) => controller.remove(req, res));
router.post('/:id/download', (req, res) => controller.download(req, res));

export default router;