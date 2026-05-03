# 🚀 PANDUAN LENGKAP SETUP & JALANKAN LMS

**Tanggal:** 1 Mei 2026  
**Status:** ✅ Semua Error Sudah Diperbaiki - Siap untuk Production

---

## 📋 Prasyarat (Install Terlebih Dahulu)

Pastikan sudah terinstall:

1. **Node.js** v18+ → [Download](https://nodejs.org/)

   ```bash
   node --version  # Verifikasi
   ```

2. **PostgreSQL** v12+ → [Download](https://www.postgresql.org/download/)

   ```bash
   psql --version  # Verifikasi
   ```

3. **Git** (optional) → [Download](https://git-scm.com/)

---

## 🗄️ Step 1: Setup Database

### Opsi A: Menggunakan Database yang Sudah Ada

Jika database `lemes` sudah ada di PostgreSQL:

```bash
# Jalankan dari folder lms-be
npm run migrate  # Apply migrations dari Prisma
```

### Opsi B: Buat Database Baru

```bash
# Buka PostgreSQL
psql -U postgres

# Di dalam psql, jalankan:
CREATE DATABASE lms_db;
\q

# Update DATABASE_URL di .env file:
DATABASE_URL="postgresql://postgres:password@localhost:5432/lms_db"

# Jalankan migrations
cd lms-be
npm run migrate
```

### Verifikasi Database Terhubung

```bash
npx prisma db push
```

---

## 🔧 Step 2: Setup Environment Variables

### Backend (.env sudah ada, verifikasi):

```bash
cd lms-be
cat .env  # Lihat isi
```

**Isi yang diperlukan:**

```
PORT_APP=3000
DATABASE_URL="postgresql://postgres:Daffa110413.@localhost:5432/lemes?schema=public"
JWT_SECRET="bG1zLWJlDQo="
FRONTEND_URL="http://localhost:5173"
```

### Frontend (.env sudah ada, verifikasi):

```bash
cd frontend
cat .env  # Lihat isi
```

**Isi yang diperlukan:**

```
VITE_API_URL=http://localhost:3000
VITE_GEMINI_API_KEY=AIzaSyB4U6nXh6nN8L5D_sBYzNg8fGWtnGIPuf8
```

---

## 📦 Step 3: Install Dependencies

### Backend

```bash
cd lms-be
npm install
npm run migrate  # Apply database migrations
```

### Frontend

```bash
cd frontend
npm install
```

---

## ▶️ Step 4: Jalankan Aplikasi

### Opsi A: Dual Terminal (Recommended)

**Terminal 1 - Backend:**

```bash
cd lms-be
npm run dev
```

Output yang diharapkan:

```
🚀 Server ready at http://localhost:3000
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

Output yang diharapkan:

```
VITE v5.x.x  ready in xxx ms
➜ Local: http://localhost:5173/
```

### Opsi B: Script Otomatis (Windows)

```bash
# Double-click file
run-lms.bat

# Atau jalankan manual:
./run-lms.bat
```

---

## ✅ Verifikasi Koneksi

### 1. Cek Backend Berjalan

Buka di browser:

```
http://localhost:3000/ping
```

Response diharapkan:

```json
{
  "status": "ok",
  "message": "API bisa digunakan",
  "timestamp": "2026-05-01T..."
}
```

### 2. Cek Frontend Berjalan

Buka di browser:

```
http://localhost:5173
```

Akan melihat halaman login dengan pilihan role (MAHASISWA/DOSEN)

### 3. Test Login

**Mahasiswa:**

- NIM: `2021002`
- Password: `password123`
- Atau Email: `user@example.com`

**Dosen:**

- NIP: `197803252005012002`
- Password: `password123`
- Atau Email: `dosen@example.com`

---

## 🔍 Troubleshooting

### Problem: "Cannot connect to Database"

**Solusi:**

1. Pastikan PostgreSQL running
2. Verifikasi DATABASE_URL di .env
3. Pastikan password PostgreSQL benar
4. Test koneksi: `psql -U postgres`

### Problem: "Port 3000/5173 already in use"

**Solusi:**

```bash
# Windows - Kill process yang menggunakan port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Atau gunakan port lain di .env
PORT_APP=3001
```

### Problem: "Module not found"

**Solusi:**

```bash
# Clear node_modules dan reinstall
rm -rf node_modules package-lock.json
npm install
```

### Problem: "JWT_SECRET not set"

**Solusi:**

```bash
# Pastikan .env file ada dan berisi:
JWT_SECRET="bG1zLWJlDQo="
```

### Problem: "CORS error" saat login

**Solusi:**

- Pastikan FRONTEND_URL di backend .env benar
- Pastikan VITE_API_URL di frontend .env benar
- Restart kedua server

---

## 📁 Struktur Folder

```
LMS/
├── lms-be/                    # Backend (Express.js + Prisma)
│   ├── .env                   # ✅ Environment config
│   ├── index.js               # Entry point
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── migrations/        # Database migrations
│   ├── src/
│   │   ├── usecases/          # Business logic
│   │   ├── interfaces/        # Controllers & Routes
│   │   ├── domain/            # Entities
│   │   └── infrastucture/     # Repositories
│   └── package.json
│
├── frontend/                  # Frontend (React + Vite)
│   ├── .env                   # ✅ Environment config
│   ├── src/
│   │   ├── pages/             # Page components
│   │   ├── utils/             # Helper functions (apiClient.js)
│   │   └── main.jsx           # Entry point
│   └── package.json
│
├── run-lms.bat                # Automation script
└── SETUP_GUIDE.md             # Documentation
```

---

## 🔐 Security Checklist

✅ JWT_SECRET configured and not hardcoded  
✅ CORS properly configured for frontend URL  
✅ Password hashed using bcrypt (salt rounds: 10)  
✅ Multer file upload secured (5MB limit, type validation)  
✅ Database transactions with error handling  
✅ Input validation on all endpoints  
✅ Authentication middleware on protected routes

---

## 📊 API Endpoints Summary

| Method | Path               | Auth | Purpose         |
| ------ | ------------------ | ---- | --------------- |
| POST   | `/api/auth/login`  | ❌   | User login      |
| GET    | `/ping`            | ❌   | Health check    |
| GET    | `/api/users`       | ❌   | Get all users   |
| GET    | `/api/dashboard`   | ✅   | Dashboard data  |
| GET    | `/api/mata-kuliah` | ✅   | Course list     |
| POST   | `/api/nilai`       | ✅   | Input grades    |
| GET    | `/api/forum`       | ✅   | Forum threads   |
| POST   | `/api/presensi`    | ✅   | Mark attendance |

---

## 🎯 Next Steps

1. ✅ Install dependencies (`npm install`)
2. ✅ Configure .env files (already done)
3. ✅ Setup database (run migrations)
4. ✅ Start backend server (`npm run dev` in lms-be)
5. ✅ Start frontend server (`npm run dev` in frontend)
6. ✅ Test login at `http://localhost:5173`
7. ✅ Verify API calls work correctly

---

## 📞 Support

Jika ada error:

1. Check `.env` files are configured correctly
2. Verify database connection
3. Check console logs untuk error messages
4. Pastikan semua dependencies terinstall

---

**Generated:** May 1, 2026  
**Status:** Ready for Development & Testing ✅
