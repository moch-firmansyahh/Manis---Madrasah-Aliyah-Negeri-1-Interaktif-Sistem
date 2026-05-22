import express from 'express';
import multer from 'multer';
import { TugasGuruController } from '../controllers/TugasGuruController.js';
import { TugasGuruUseCase } from '../../usecases/TugasGuruUseCase.js';
import { PrismaTugasGuruRepository } from '../../infrastucture/repositories/PrismaTugasGuruRepository.js';
import { PrismaMataKuliahRepository } from '../../infrastucture/repositories/PrismaMataKuliahReposiory.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

// Setup multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Allow common document types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed. Only PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG are allowed.'), false);
    }
  }
});

const router = express.Router();

const repository = new PrismaTugasGuruRepository();
const matkulRepo = new PrismaMataKuliahRepository();
const usecase = new TugasGuruUseCase(repository, matkulRepo);
const controller = new TugasGuruController(usecase);

router.use(authMiddleware);

router.get('/', (req, res) => controller.getAllTugas(req, res));
router.get('/mata-kuliah/:idMataKuliah', (req, res) => {
  // Pass the idMataKuliah into the query or handle it in controller
  // For simplicity, we just attach it to req.query so the controller can optionally use it
  req.query.idMataKuliah = req.params.idMataKuliah;
  controller.getAllTugas(req, res);
});
router.post('/', upload.single('fileTugas'), (req, res) => controller.create(req, res));
router.put('/:id', upload.single('fileTugas'), (req, res) => controller.update(req, res));
router.patch('/:id', upload.single('fileTugas'), (req, res) => controller.update(req, res)); // S1 PATCH
router.delete('/:id', (req, res) => controller.destroy(req, res));
router.post('/grades', (req, res) => controller.submitGrades(req, res));

export default router;