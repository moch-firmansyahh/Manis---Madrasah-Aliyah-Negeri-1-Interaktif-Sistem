# 🎓 Manis — Madrasah Aliyah Negeri 1 Interaktif Sistem

> Platform Learning Management System (LMS) interaktif berbasis web untuk memudahkan Guru dalam mengelola kelas, tugas, presensi, serta memantau progres belajar Siswa secara real-time di Madrasah Aliyah Negeri 1 Sumedang.

## 📖 Tentang Proyek

**Manis (Madrasah Aliyah Negeri 1 Interaktif Sistem)** dirancang untuk mengatasi tantangan interaksi pembelajaran daring dan luring. Platform ini memfasilitasi kebutuhan:

- **Guru**: Mengelola kelas/kelompok belajar, mempublikasikan materi & tugas, mengelola presensi siswa, serta melihat visualisasi performa dan keaktifan siswa.
- **Siswa**: Mengakses ruang kelas virtual, mengunduh materi, mengumpulkan tugas secara langsung, dan memantau kehadiran mereka secara transparan.

---

## 🛠️ Teknologi yang Digunakan

| Komponen     | Teknologi                       |
| :----------- | :------------------------------ |
| **Frontend** | React.js (Vite), Tailwind CSS   |
| **Backend**  | Node.js, Express.js, Prisma ORM |
| **Database** | PostgreSQL                      |
| **Design**   | Figma                           |

---

## 📁 Struktur Monorepo

Proyek ini dibangun menggunakan struktur monorepo yang memisahkan frontend dan backend:

```text
Learning_Management_System/
├── frontend/          # Aplikasi Frontend (React.js + Vite)
├── lms-be/            # API Server Backend (Express.js + Prisma)
├── daftar-akun.md     # Daftar akun guru & siswa untuk pengujian/demo
└── README.md          # Dokumentasi utama proyek
```

---

## 🚀 Panduan Instalasi & Menjalankan Aplikasi

Pastikan Anda sudah menginstal [Node.js](https://nodejs.org/) (versi 18+) dan [PostgreSQL](https://www.postgresql.org/) di perangkat Anda.

### 1. Clone Repository

```bash
git clone https://github.com/moch-firmansyahh/Madrasah-Aliyah-Negeri-1-Interaktif-Sistem.git
cd Learning_Management_System
```

### 2. Konfigurasi & Jalankan Backend (`lms-be`)

1. Masuk ke folder backend:
   ```bash
   cd lms-be
   ```
2. Instal dependensi:
   ```bash
   npm install
   ```
3. Buat file `.env` di folder `lms-be/` dan isi dengan konfigurasi database Anda:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/manis_db?schema=public"
   JWT_SECRET="rahasia_super_aman_kamu"
   ```
4. Jalankan migrasi database dan seed data awal (sangat penting untuk membuat role & akun bawaan):
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init_manis
   npx prisma db seed
   ```
5. Jalankan server backend dalam mode pengembangan:
   ```bash
   npm run dev
   ```
   _Backend akan berjalan secara default di `http://localhost:3000`._

### 3. Konfigurasi & Jalankan Frontend (`frontend`)

1. Buka terminal baru dan masuk ke folder frontend:
   ```bash
   cd ../frontend
   ```
2. Instal dependensi:
   ```bash
   npm install
   ```
3. Jalankan server frontend:
   ```bash
   npm run dev
   ```
   _Frontend akan berjalan di `http://localhost:5173`._

---

## 🔑 Informasi Akun Uji Coba

Untuk memudahkan pengujian fungsionalitas sistem (Login Guru & Siswa), kami menyediakan daftar akun uji coba yang siap pakai setelah proses seeding database selesai.

Silakan cek file [daftar-akun.md](./daftar-akun.md) untuk melihat daftar lengkap _Username_, _Email_, _Password_, serta pembagian _Kelas/Mata Pelajaran_.
