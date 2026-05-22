import express from "express"
import "dotenv/config";
import cors from "cors";
import userRoutes from './src/interfaces/routes/userRoutes.js';
import mataKuliahRoutes from './src/interfaces/routes/mataKuliahRoutes.js';
import nilaiRoutes from './src/interfaces/routes/nilaiRoutes.js';
import { AuthUseCase } from './src/usecases/AuthUseCase.js';
import { PrismaUserRepository } from './src/infrastucture/repositories/PrismaUserRepository.js';
import { authMiddleware } from './src/interfaces/middlewares/authMiddleware.js';
import authRoutes from './src/interfaces/routes/authRoutes.js';
import presensiRoutes from './src/interfaces/routes/presensiRoutes.js';
import dashboardRoutes from './src/interfaces/routes/dashboardRoutes.js';
import forumRoutes from './src/interfaces/routes/forumRoutes.js';
import kuisRoutes from './src/interfaces/routes/kuisRoutes.js';
import dashboardGuruRoutes from './src/interfaces/routes/dashboardGuruRoutes.js';
import guruForumRoutes from './src/interfaces/routes/guruForumRoutes.js';
import kelompokRoutes from './src/interfaces/routes/kelompokRoutes.js';
import modulAjarRoutes from './src/interfaces/routes/modulAjarRoutes.js';
import materiRoutes from './src/interfaces/routes/materiRoutes.js';
import presensiGuruRoutes from './src/interfaces/routes/presensiGuruRoutes.js';
import guruProfileRoutes from './src/interfaces/routes/guruProfileRoutes.js';
import tugasGuruRoutes from './src/interfaces/routes/tugasGuruRoutes.js';
import tugasRoutes from './src/interfaces/routes/tugasRoutes.js';
import profileRoutes from './src/interfaces/routes/profileRoutes.js';
import notifikasiRoutes from './src/interfaces/routes/notifikasiRoutes.js';

const app = express();
const PORT = process.env.PORT_APP || process.env.PORT || 8080;

const userRepository = new PrismaUserRepository();
const authUseCase = new AuthUseCase(userRepository);

// CORS Configuration
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowed = [
      process.env.FRONTEND_URL,
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:3000",
      "https://manis-madrasah-aliyah-negeri-1-inte.vercel.app"
    ].filter(Boolean);
    if (allowed.includes(origin) || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. Endpoint Selamat Datang (Root)
app.get('/', (req, res) => {
  res.send("Selamat datang di LMS API! Server berjalan dengan baik.");
});

// 2. Endpoint Ping (Health Check)
app.get('/ping', (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "API bisa digunakan",
    timestamp: new Date().toISOString()
  });
});

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// --- UNPROTECTED ROUTES ---
// Auth routes harus SEBELUM userRoutes agar /api/auth/login tidak tertangkap /api route
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);

// --- PROTECTED ROUTES ---
// Semua route setelah baris ini akan melewati authMiddleware
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/mata-kuliah', authMiddleware, mataKuliahRoutes);
app.use('/api/presensi', authMiddleware, presensiRoutes);
app.use('/api/forum', forumRoutes); // forumRoutes handles its own auth per-endpoint
app.use('/api/kuis', authMiddleware, kuisRoutes);
app.use('/api/nilai', authMiddleware, nilaiRoutes);
app.use('/api/guru/dashboard', authMiddleware, dashboardGuruRoutes);
app.use('/api/guru/forum', authMiddleware, guruForumRoutes);
app.use('/api/kelompok', authMiddleware, kelompokRoutes);
app.use('/api/modul-ajar', authMiddleware, modulAjarRoutes);
app.use('/api/materi', authMiddleware, materiRoutes);
app.use('/api/guru/presensi', authMiddleware, presensiGuruRoutes);
app.use('/api/guru/profile', authMiddleware, guruProfileRoutes);
app.use('/api/guru/tugas', authMiddleware, tugasGuruRoutes); // Guru tugas management
app.use('/api/tugas', authMiddleware, tugasRoutes);           // Siswa tugas (harus di atas guru)
app.use('/api/tugas', authMiddleware, tugasGuruRoutes);      // Fallback guru routes (/mata-kuliah/:id, dll)
app.use('/api/profile', profileRoutes);
app.use('/api/notifikasi', authMiddleware, notifikasiRoutes);                       // Shared profile (photo + password)

// Debug route for testing
app.post('/api/tugas-debug', (req, res) => {
  console.log("DEBUG endpoint hit");
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
});