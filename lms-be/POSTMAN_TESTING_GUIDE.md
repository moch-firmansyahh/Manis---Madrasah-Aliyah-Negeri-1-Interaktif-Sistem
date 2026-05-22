# Panduan Testing Postman (S1 - S9)

Panduan ini berisi cara melakukan _testing_ seluruh endpoint API (S1 sampai S9) menggunakan aplikasi Postman. 

> **PENTING: Aturan Token**
> Hampir semua endpoint S1 sampai S8 membutuhkan otorisasi. Oleh karena itu, kamu **WAJIB** melakukan [S9 (Autentikasi/Login)](#s9-autentikasi-wajib-pertama-kali) terlebih dahulu, mengambil tokennya, lalu memasukannya di tab **Authorization -> Type: Bearer Token** pada Postman untuk endpoint lainnya.

---

## S9. Autentikasi (Wajib Pertama Kali)
Digunakan untuk mendapatkan token akses (Login).

- **Method:** `POST`
- **URL:** `http://localhost:3000/api/auth/login`
- **Tab Body:** `raw` -> `JSON`
- **Isi Body (Login Dosen):**
  ```json
  {
    "nomorInduk": "lestari@kampus.ac.id",
    "password": "password123",
    "role": "DOSEN"
  }
  ```
- **Isi Body (Login Mahasiswa):**
  ```json
  {
    "nomorInduk": "2021002",
    "password": "password123",
    "role": "MAHASISWA"
  }
  ```

---

## S1. Kelola Tugas (Oleh Dosen)
*Gunakan Token Dosen di tab Authorization.*

### 1. Lihat Daftar Tugas Kelas
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/tugas/mata-kuliah/1` *(Ganti `1` dengan ID Matkul)*

### 2. Buat Tugas Baru
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/tugas`
- **Tab Body:** `raw` -> `JSON`
  ```json
  {
    "judul": "Tugas Makalah Struktur Data",
    "idMataKuliah": 1,
    "deskripsi": "Buat makalah tentang implementasi Tree. Minimal 10 halaman.",
    "deadlineTugas": "2026-06-01T23:59:00.000Z"
  }
  ```

### 3. Update Tugas
- **Method:** `PATCH`
- **URL:** `http://localhost:3000/api/tugas/1` *(Ganti `1` dengan ID Tugas)*
- **Tab Body:** `raw` -> `JSON`
  ```json
  {
    "judul": "Tugas Makalah Struktur Data (Revisi)"
  }
  ```

### 4. Hapus Tugas
- **Method:** `DELETE`
- **URL:** `http://localhost:3000/api/tugas/1`

---

## S2. Kelola Anggota
*Endpoint umum untuk melihat pengguna & matkul.*

### 1. Lihat Semua User
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/users`

### 2. Lihat Semua Mata Kuliah
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/mata-kuliah`

### 3. Lihat Detail Mata Kuliah
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/mata-kuliah/1`

### 4. Buat Mata Kuliah Baru
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/mata-kuliah`
- **Tab Body:** `raw` -> `JSON`
  ```json
  {
    "namaMataKuliah": "Pemrograman API",
    "nipDosen": "19800101201001101"
  }
  ```

### 5. Update Mata Kuliah
- **Method:** `PATCH`
- **URL:** `http://localhost:3000/api/mata-kuliah/1`
- **Tab Body:** `raw` -> `JSON`
  ```json
  {
    "namaMataKuliah": "Pemrograman Web Lanjut (Kelas B)"
  }
  ```

---

## S3. Hapus Mata Kuliah
*Gunakan Token Dosen.*

- **Method:** `DELETE`
- **URL:** `http://localhost:3000/api/mata-kuliah/11`
> ⚠️ Gunakan ID mata kuliah yang **baru kamu buat di S2** (misal ID 11). Jangan hapus ID 1-10 karena data seed-nya masih dipakai S lainnya.

---

## S4. Monitoring Progress (Dashboard Mahasiswa)
*Gunakan Token Mahasiswa (login dengan `U001` / `password123`).*

- **Method:** `GET`
- **URL:** `http://localhost:3000/api/dashboard/mahasiswa`

---

## S5. Upload Tugas (Oleh Mahasiswa)
*Gunakan Token Mahasiswa.*

### 1. Lihat Daftar Tugas
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/tugas/mahasiswa`
- **Jika tidak ada, gunakan:** `http://localhost:3000/api/tugas?idMataKuliah=1`

### 2. Mengumpulkan Tugas
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/tugas/2/submit`
> Ganti `2` dengan ID Tugas yang **belum** ada pengumpulannya.
- **Tab Body:** Pilih `form-data`
  | Key | Value | Type |
  |-----|-------|------|
  | nim | 202601 | Text |
  | judul | Jawaban Tugas Saya | Text |
  | file | *(pilih file)* | File |

### 3. Lihat Hasil Pengumpulan
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/tugas/2/submission`

### 4. Hapus/Batal Kumpul
- **Method:** `DELETE`
- **URL:** `http://localhost:3000/api/tugas/submission/1`
> Ganti `1` dengan `idPengumpulan` dari respons sebelumnya.

---

## S6. Presensi

### 1. Generate Sesi Presensi (Dosen)
*Gunakan Token Dosen.*
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/dosen/presensi/matkul/1/generate`
> Ganti `1` dengan ID Mata Kuliah. Ini harus dilakukan **terlebih dahulu** sebelum mahasiswa bisa scan presensi.

### 2. Lihat Kehadiran Kelas (Dosen)
*Gunakan Token Dosen.*
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/presensi/mata-kuliah/1`

### 3. Scan QR / Catat Kehadiran (Mahasiswa)
*Gunakan Token Mahasiswa.*
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/presensi/scan`
- **Tab Body:** `raw` -> `JSON`
  ```json
  {
    "idMataKuliah": 1,
    "token": "Manis-abcd1234"
  }
  ```

### 4. Riwayat Kehadiran Mahasiswa
*Gunakan Token Mahasiswa.*
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/presensi/mahasiswa/1`

### 5. Summary Kehadiran
*Gunakan Token Mahasiswa.*
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/presensi/summary/1`

---

## Kelompok

### 1. Lihat Semua Kelompok
*Gunakan Token Dosen.*
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/kelompok`

### 2. Lihat Daftar Kelompok per Mata Kuliah
*Gunakan Token Dosen.*
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/kelompok/1`

### 3. Buat Kelompok Baru
*Gunakan Token Dosen.*
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/kelompok`
- **Tab Body:** `raw` -> `JSON`
  ```json
  {
    "idMataKuliah": 1,
    "namaKelompok": "Kelompok A",
    "warna": "#4b53bc"
  }
  ```

### 3. Tambah Anggota ke Kelompok
*Gunakan Token Dosen.*
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/kelompok/1/members`
- **Tab Body:** `raw` -> `JSON`
  ```json
  {
    "nim": "2026001"
  }
  ```

### 4. Hapus Anggota dari Kelompok
*Gunakan Token Dosen.*
- **Method:** `DELETE`
- **URL:** `http://localhost:3000/api/kelompok/1/members/2026001`

### 5. Simpan Nilai Kelompok
*Gunakan Token Dosen.*
- **Method:** `PUT`
- **URL:** `http://localhost:3000/api/kelompok/1/grades`
- **Tab Body:** `raw` -> `JSON`
  ```json
  {
    "grades": [
      { "nim": "2026001", "nilai": 85.5 }
    ]
  }
  ```

---

## S7. Penilaian

### 1. Lihat Nilai per Mata Kuliah
*Gunakan Token Mahasiswa.*
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/nilai/mahasiswa/1`

### 2. Masukkan Nilai Baru (Dosen)
*Gunakan Token Dosen.*
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/nilai`
- **Tab Body:** `raw` -> `JSON`
  ```json
  {
    "nomorInduk": "U002",
    "idMataKuliah": 2,
    "nilaiTugas": 85,
    "nilaiKuis": 90
  }
  ```

### 3. Update Nilai
- **Method:** `PATCH`
- **URL:** `http://localhost:3000/api/nilai/1`
- **Tab Body:** `raw` -> `JSON`
  ```json
  {
    "nilaiTugas": 88,
    "nilaiKuis": 92
  }
  ```

### 4. Lihat Transkrip Mahasiswa
*Gunakan Token Mahasiswa.*
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/nilai/transkrip/mahasiswa`

---

## S8. Diskusi (Forum)
*Gunakan Token Dosen atau Mahasiswa.*

### 1. Lihat Daftar Topik Diskusi
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/forum/mata-kuliah/1`

### 2. Lihat Komentar (By ID)
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/forum/comment/1`
> Ganti `1` dengan ID komentar

### 3. Buat Topik Diskusi Baru
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/forum/thread`
- **Tab Body:** `raw` -> `JSON`
  ```json
  {
    "idMataKuliah": 1,
    "judul": "Implementasi Binary Search Tree",
    "isiForum": "Halo teman-teman, adakah yang paham bagian insert data di BST?"
  }
  ```

### 3. Tambah Komentar
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/forum/comment`
- **Tab Body:** `raw` -> `JSON`
  ```json
  {
    "idForum": 1,
    "isiKomentar": "Saya paham, coba lihat contoh kode ini..."
  }
  ```

### 4. Like / Unlike Thread
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/forum/like`
- **Tab Body:** `raw` -> `JSON`
  ```json
  {
    "idForum": 1
  }
  ```

### 5. Edit Forum Diskusi
- **Method:** `PUT`
- **URL:** `http://localhost:3000/api/forum/thread/1`
- **Tab Body:** `raw` -> `JSON`
  ```json
  {
    "judul": "Judul yang sudah diperbarui",
    "isiForum": "Isi diskusi yang sudah diperbarui"
  }
  ```
> ⚠️ Hanya penulis thread yang dapat mengeditnya.

### 6. Hapus Forum Diskusi
- **Method:** `DELETE`
- **URL:** `http://localhost:3000/api/forum/thread/1`
> ⚠️ Hanya penulis thread yang dapat menghapusnya.

### 7. Edit Komentar
- **Method:** `PUT`
- **URL:** `http://localhost:3000/api/forum/comment/:idKomentar`
- **Tab Params:** `idKomentar`: `1` *(ganti dengan ID komentar)*
- **Tab Body:** `raw` -> `JSON`
  ```json
  {
    "isiKomentar": "Komentar yang sudah diperbarui"
  }
  ```
> ⚠️ Hanya penulis komentar yang dapat mengeditnya.

### 8. Hapus Komentar
- **Method:** `DELETE`
- **URL:** `http://localhost:3000/api/forum/comment/1`
- **Tab Params:** `idKomentar`: `1` *(ganti dengan ID komentar)*
> ⚠️ Hanya penulis komentar yang dapat menghapusnya.
