# LMS Setup Guide - Menjalankan Frontend & Backend Bersamaan

Panduan lengkap untuk menjalankan Learning Management System (LMS) dengan menyambungkan frontend dan backend secara bersamaan.

---

## 📋 Prasyarat

Pastikan Anda sudah menginstal:
- ✅ **Node.js** (v18 atau lebih baru) - [Download](https://nodejs.org/)
- ✅ **PostgreSQL** (v12 atau lebih baru) - [Download](https://www.postgresql.org/download/)
- ✅ **npm** atau **yarn** (biasanya sudah terinstal dengan Node.js)

Verifikasi instalasi:
```bash
node --version
npm --version
psql --version
```

---

## 🚀 Quick Start (Cara Cepat)

### Windows Users - Double-click Script
```
run-lms.bat
```

Script ini akan:
1. ✅ Mengecek dependencies dan menginstal jika diperlukan
2. ✅ Menjalankan Backend di terminal baru (port 3000)
3. ✅ Menjalankan Frontend di terminal baru (port 5173)
4. ✅ Menampilkan informasi koneksi dan kredensial login

---

## 🛠️ Manual Setup (Kalau Script Tidak Bekerja)

### Terminal 1 - Backend Server

```bash
# Masuk ke direktori backend
cd lms-be

# Install dependencies (jika belum)
npm install

# Jalankan development server
npm run dev
```

**Output yang diharapkan:**
```
🚀 Server ready at http://localhost:3000
```

### Terminal 2 - Frontend Server

```bash
# Masuk ke direktori frontend
cd frontend

# Install dependencies (jika belum)
npm install

# Jalankan development server
npm run dev
```

**Output yang diharapkan:**
```
VITE v5.x.x ready in xxx ms

➜ Local: http://localhost:5173/
```

---

## 📱 Akses Aplikasi

Setelah kedua server berjalan:

| Component | URL |
|-----------|-----|
| **Frontend** | http://localhost:5173 |
| **Backend API** | http://localhost:3000 |
| **API Docs** | http://localhost:3000/api |
| **Health Check** | http://localhost:3000/ping |

---

## 🔐 Credentials Testing

### Mahasiswa
```
NIM/Email: 2021002
Password:  password123
Role:      MAHASISWA
```

### Dosen
```
NIP/Email: 197803252005012002
Password:  password123
Role:      DOSEN
```

### Admin
```
Username: U001
Password: password123
Role:     ADMIN
```

---

## 🗄️ Database Configuration

### PostgreSQL Connection
```
Host:     localhost
Port:     5432
Database: LMS
User:     postgres
Password: Hilmi17 (sesuaikan dengan setup Anda)
```

### Setup Database Pertama Kali

```bash
cd lms-be

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init_lms

# Seed data (jika diperlukan)
npx prisma db seed
```

---

## 🔌 Konfigurasi Koneksi

### Backend (.env)
File: `lms-be/.env`
```
PORT_APP=3000
DATABASE_URL=postgresql://postgres:Hilmi17@localhost:5432/LMS?schema=public
JWT_SECRET=bG1zLWJlDQo=
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
File: `frontend/.env`
```
VITE_API_URL=http://localhost:3000
VITE_GEMINI_API_KEY=AIzaSyB4U6nXh6nN8L5D_sBYzNg8fGWtnGIPuf8
```

---

## ✅ Verifikasi Koneksi

### Test Backend Health
```bash
curl http://localhost:3000/ping
```

**Response yang diharapkan:**
```json
{
  "status": "ok",
  "message": "API bisa digunakan",
  "timestamp": "2024-04-30T10:30:45.123Z"
}
```

### Test Login via Backend
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "nomorInduk": "2021002",
    "password": "password123",
    "role": "MAHASISWA"
  }'
```

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Web Browser                          │
│              (http://localhost:5173)                    │
└──────────────────────────┬──────────────────────────────┘
                           │
                    React + Vite
                    (Frontend)
                           │
              ┌────────────┴────────────┐
              │                         │
         HTTP Requests              CORS
              │                         │
    ┌─────────▼──────────────────────────────────────┐
    │         Express.js Backend                    │
    │    (http://localhost:3000)                    │
    │                                                │
    │  • Authentication (JWT)                       │
    │  • Business Logic (Use Cases)                 │
    │  • Database Operations                        │
    └──────────────┬────────────────────────────────┘
                   │
              Prisma ORM
                   │
    ┌──────────────▼────────────────────┐
    │     PostgreSQL Database           │
    │  (localhost:5432/LMS)             │
    └───────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### Port Sudah Terpakai
```bash
# Cari process yang menggunakan port 3000
netstat -ano | findstr :3000

# Kill process (ganti PID dengan ID yang ditemukan)
taskkill /PID <PID> /F

# Ganti port di .env jika diperlukan
```

### CORS Error
✅ **Sudah diperbaiki dengan menambahkan CORS middleware di backend**

Pastikan `FRONTEND_URL` di `.env` backend sesuai dengan URL frontend Anda.

### Database Connection Error
```bash
# Test koneksi PostgreSQL
psql -U postgres -h localhost -d LMS

# Jika error, periksa:
1. PostgreSQL service sudah berjalan?
2. Credentials benar di .env?
3. Database "LMS" sudah dibuat?
```

### Dependencies Error
```bash
# Clear cache dan reinstall
cd lms-be
rm -r node_modules package-lock.json
npm install

cd ../frontend
rm -r node_modules package-lock.json
npm install
```

---

## 📝 API Endpoints Utama

### Authentication
- `POST /api/auth/login` - Login user

### Student (Mahasiswa)
- `GET /api/dashboard/mahasiswa` - Dashboard
- `GET /api/mata-kuliah` - List mata kuliah
- `GET /api/nilai/:nomorInduk` - Nilai mahasiswa
- `GET /api/presensi/mata-kuliah/:id` - Presensi

### Lecturer (Dosen)
- `GET /api/dosen/dashboard` - Dashboard dosen
- `POST /api/dosen/tugas` - Buat tugas
- `GET /api/dosen/presensi` - Kelola presensi
- `POST /api/dosen/forum` - Buat forum

---

## 📚 Stack Technology

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, CSS3 |
| **Backend** | Node.js, Express.js 5 |
| **Database** | PostgreSQL 12+ |
| **ORM** | Prisma 7.8 |
| **Auth** | JWT, Bcrypt |
| **Architecture** | Clean Architecture |

---

## 🎯 Next Steps

1. ✅ Run script `run-lms.bat`
2. ✅ Open http://localhost:5173 di browser
3. ✅ Login dengan credentials testing
4. ✅ Explore dashboard

---

## 📞 Support

Jika ada masalah:
1. Cek terminal untuk error messages
2. Pastikan PostgreSQL sudah running
3. Verifikasi konfigurasi .env
4. Lihat dokumentasi API: [API_DOCUMENTATION.md](./lms-be/API_DOCUMENTATION.md)
5. Lihat status backend: [STATUS_REPORT.md](./lms-be/STATUS_REPORT.md)

---

**Last Updated:** April 30, 2026
**Status:** ✅ Production Ready
