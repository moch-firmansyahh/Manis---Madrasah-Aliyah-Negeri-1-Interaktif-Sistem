# Manis Backend - Clean Architecture

Sistem Backend untuk Madrasah Aliyah Negeri 1 Interaktif Sistem (Manis) yang dibangun menggunakan **Node.js**, **Express**, dan **Prisma ORM** dengan database **PostgreSQL**. Proyek ini menerapkan **Clean Architecture** untuk memastikan kode mudah dikelola, diuji, dan dikembangkan.

## 🚀 Fitur Utama

- **Clean Architecture**: Pemisahan lapisan Domain, Use Cases, Interfaces, dan Infrastructure.
- **Authentication**: JWT (JSON Web Token) & Hashing Password dengan Bcrypt.
- **Role-Based Access**: Pembedaan profil antara Admin, Siswa, dan Guru.
- **Automated ID Generation**:
  - User: `U001`, `D001`, `P001` (otomatis berdasarkan Role).
  - Siswa: NIS otomatis (contoh: `2026001`).
- **Database Relations**: Integrasi relasi tabel dengan fitur _Cascade Delete_.

---

## 🛠️ Prasyarat

Sebelum memulai, pastikan kamu sudah menginstal:

- [Node.js](https://nodejs.org/) (versi 18 atau lebih baru)
- [PostgreSQL](https://www.postgresql.org/)
- npm atau yarn

---

## 📦 Instalasi

1. **Clone repositori:**

   ```bash
   git clone https://github.com/ListiantoHilmi/manis-be.git
   cd manis-be

   ```

2. **Instal dependensi:**

   ```bash
   npm install

   ```

3. **Konfigurasi Environment:**
   Buat file .env di folder root dan sesuaikan kredensial databasemu:
   Cuplikan kode

   ```text
   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/NAMA_DATABASE?schema=public"
   JWT_SECRET="rahasia_super_aman_kamu"
   ```

---

🗄️ Setup Database (Prisma)
Jalankan perintah berikut secara berurutan untuk menyiapkan database:

1. Generate Prisma Client:

   ```bash
   npx prisma generate
   ```

2. Jalankan Migrasi:
   (Ini akan membuat tabel-tabel di database kamu)

   ```bash
   npx prisma migrate dev --name init_manis
   ```

3. Seed Data (Sangat Penting):
   Isi tabel Role (Admin, Siswa, Guru) secara otomatis:

   ```bash
   npx prisma db seed
   ```

---

🏃 Menjalankan Aplikasi

Menjalankan server dalam mode pengembangan (development) menggunakan:

```bash
npm run dev
```

Server akan berjalan di: http://localhost:3000

---

📖 Struktur Folder

```text
src/
├── domain/ # Business Logic Inti (Entity, Utility, Interface Repository)
├── usecases/ # Aturan Bisnis Aplikasi (Logic Register, Login, dll)
├── interfaces/ # Adapter (Controller, Routes, Middleware)
└── infrastructure/ # Hal Teknis (Implementasi Prisma, Repository)
prisma/ # Skema Database dan Script Seeding
```

---

🔗 Endpoint API (Ringkasan)

1. Public Routes

   ```text
   GET /ping - Cek status API.
   POST /api/login - Login untuk mendapatkan JWT Token.
   ```

2. Protected Routes (Membutuhkan Header Authorization: Bearer <token>)

   ```text
   POST /api/users - Registrasi User baru (ID & NIS otomatis).
   GET /api/users - List semua user.
   PATCH /api/users/:nomorInduk - Update data user.
   DELETE /api/users/:nomorInduk - Hapus user (Cascade delete profil).
   ```

---

🧪 Cara Test Create User

Kirim POST ke /api/users dengan JSON body:

```json
{
  "nama": "Budi Siswa",
  "email": "budi@man1.sch.id",
  "password": "password123",
  "roleId": 2,
  "nis": "" // Kosongkan, sistem akan generate otomatis 2026xxx
}
```

```json
{
  "nama": "Dr. Subiakto, M.Pd",
  "email": "subiakto@man1.sch.id",
  "password": "password123",
  "roleId": 3,
  "nip": "09.123.456.7-890.000" // Gunakan NIP Guru
}
```

### Saran Tambahan:

Jika kamu menggunakan GitHub, jangan lupa buat file `.gitignore` dan pastikan isinya mencakup:

```text
node_modules
.env
dist
```
