# 🎓 Manis — Madrasah Aliyah Negeri 1 Interaktif Sistem

> Platform pembelajaran berbasis web yang memudahkan guru dalam mengelola kelompok dan memantau progress siswa secara real-time.

---

## 👥 Informasi Kelompok

| Atribut            | Detail                                   |
| :----------------- | :--------------------------------------- |
| **Nama Kelompok**  | Kelompok 8                               |
| **Mata Kuliah**    | Implementasi Perancangan Perangkat Lunak |
| **Dosen Pengampu** | Muhammad Shiddiq Azis, S.T., MBA         |

**Anggota:**

1. Moch Firmansyah
2. Listianto Hilmi Fauzaan
3. Muhammad Daffa
4. Muhammad Lutfi Fitriansyah

---

## 📖 Tentang Proyek

**Manis (Madrasah Aliyah Negeri 1 Interaktif Sistem)** adalah platform pembelajaran yang memberi akses kepada guru untuk mengelola kelompok dan memantau progress siswa dengan mudah dan efisien.

---

## 🛠️ Teknologi yang Digunakan

| Komponen     | Teknologi                    |
| :----------- | :--------------------------- |
| **Frontend** | React.js, Vite, Tailwind CSS |
| **Backend**  | Node.js, Express.js          |
| **Database** | PostgreSQL / MySQL           |
| **Design**   | Figma                        |

---

## 📊 Perancangan Sistem

### DFD Level 0

![DFD Level 0](Madrasah_Aliyah_Negeri_1_Interaktif_Sistem/assets/DFD/DFD_Level_0)

### DFD Level 1

![DFD Level 1](Madrasah_Aliyah_Negeri_1_Interaktif_Sistem/assets/DFD/DFD_Level_1)

---

## 🗄️ Entity Relationship Diagram (ERD)

![ERD](Madrasah_Aliyah_Negeri_1_Interaktif_Sistem/assets/ERD/ERD.png)

---

## 🏗️ Class Diagram

![Class Diagram](Madrasah_Aliyah_Negeri_1_Interaktif_Sistem/assets/Class_Diagram/Class_Diagram.png)

---

## 🎨 Mockup Antarmuka (Figma)

> _(Link Figma atau screenshot mockup dapat ditambahkan di sini)_

---

## 🚀 Panduan Instalasi

Pastikan kamu sudah menginstal [Node.js](https://nodejs.org/) sebelum memulai.

### 1. Clone Repository

```bash
git clone https://github.com/username/manis.git
cd manis
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Buat file `.env` di folder `backend/` dan isi konfigurasi berikut:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=manis_db
DB_USER=your_username
DB_PASS=your_password
PORT=5000
```

Jalankan server backend:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`.

---

## 📁 Struktur Proyek

```
manis/
├── backend/
│   ├── src/
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
└── README.md
```

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan akademik — Tugas Besar mata kuliah Implementasi Perancangan Perangkat Lunak.
