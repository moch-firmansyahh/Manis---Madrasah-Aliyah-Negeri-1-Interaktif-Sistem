/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to alter the column `email` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - Added the required column `nama` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nomorInduk` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StatusKehadiran" AS ENUM ('Hadir', 'Izin', 'Sakit', 'Alpha');

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
DROP COLUMN "name",
ADD COLUMN     "nama" VARCHAR(100) NOT NULL,
ADD COLUMN     "nomorInduk" VARCHAR(20) NOT NULL,
ADD COLUMN     "password" VARCHAR(255) NOT NULL,
ALTER COLUMN "email" SET DATA TYPE VARCHAR(100),
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("nomorInduk");

-- CreateTable
CREATE TABLE "Mahasiswa" (
    "nim" VARCHAR(20) NOT NULL,
    "nomorInduk" VARCHAR(20) NOT NULL,

    CONSTRAINT "Mahasiswa_pkey" PRIMARY KEY ("nim")
);

-- CreateTable
CREATE TABLE "Dosen" (
    "nip" VARCHAR(20) NOT NULL,
    "nomorInduk" VARCHAR(20) NOT NULL,

    CONSTRAINT "Dosen_pkey" PRIMARY KEY ("nip")
);

-- CreateTable
CREATE TABLE "MataKuliah" (
    "idMataKuliah" SERIAL NOT NULL,
    "namaMataKuliah" VARCHAR(150) NOT NULL,

    CONSTRAINT "MataKuliah_pkey" PRIMARY KEY ("idMataKuliah")
);

-- CreateTable
CREATE TABLE "Nilai" (
    "idNilai" SERIAL NOT NULL,
    "nomorInduk" VARCHAR(20) NOT NULL,
    "idMataKuliah" INTEGER NOT NULL,
    "nilaiTugas" DECIMAL(5,2),
    "nilaiKuis" DECIMAL(5,2),
    "nilaiAkhir" DECIMAL(5,2),

    CONSTRAINT "Nilai_pkey" PRIMARY KEY ("idNilai")
);

-- CreateTable
CREATE TABLE "Kuis" (
    "idKuis" SERIAL NOT NULL,
    "idMataKuliah" INTEGER NOT NULL,
    "judul" VARCHAR(200) NOT NULL,
    "deadlineKuis" TIMESTAMP(3),
    "skor" INTEGER,

    CONSTRAINT "Kuis_pkey" PRIMARY KEY ("idKuis")
);

-- CreateTable
CREATE TABLE "Soal" (
    "idSoal" SERIAL NOT NULL,
    "idKuis" INTEGER NOT NULL,
    "pertanyaan" TEXT NOT NULL,
    "kunciJawaban" VARCHAR(10),
    "skor" INTEGER,

    CONSTRAINT "Soal_pkey" PRIMARY KEY ("idSoal")
);

-- CreateTable
CREATE TABLE "PilihanJawaban" (
    "idPilihan" SERIAL NOT NULL,
    "idSoal" INTEGER NOT NULL,
    "teksJawaban" TEXT NOT NULL,

    CONSTRAINT "PilihanJawaban_pkey" PRIMARY KEY ("idPilihan")
);

-- CreateTable
CREATE TABLE "ForumDiskusi" (
    "idForumDiskusi" SERIAL NOT NULL,
    "idMataKuliah" INTEGER NOT NULL,
    "judul" VARCHAR(200) NOT NULL,
    "isiForum" TEXT,

    CONSTRAINT "ForumDiskusi_pkey" PRIMARY KEY ("idForumDiskusi")
);

-- CreateTable
CREATE TABLE "KomentarForum" (
    "idKomentar" SERIAL NOT NULL,
    "nomorInduk" VARCHAR(20) NOT NULL,
    "idForum" INTEGER NOT NULL,
    "isiKomentar" TEXT,

    CONSTRAINT "KomentarForum_pkey" PRIMARY KEY ("idKomentar")
);

-- CreateTable
CREATE TABLE "ModulAjar" (
    "idModulAjar" SERIAL NOT NULL,
    "idMataKuliah" INTEGER NOT NULL,
    "judul" VARCHAR(200) NOT NULL,
    "tipe_modul" VARCHAR(50),

    CONSTRAINT "ModulAjar_pkey" PRIMARY KEY ("idModulAjar")
);

-- CreateTable
CREATE TABLE "Kelompok" (
    "idKelompok" SERIAL NOT NULL,
    "idMatakuliah" INTEGER NOT NULL,
    "namaKelompok" VARCHAR(100) NOT NULL,

    CONSTRAINT "Kelompok_pkey" PRIMARY KEY ("idKelompok")
);

-- CreateTable
CREATE TABLE "Tugas" (
    "idTugas" SERIAL NOT NULL,
    "idMataKuliah" INTEGER NOT NULL,
    "nim" VARCHAR(20) NOT NULL,
    "judul" VARCHAR(200) NOT NULL,
    "detailTugas" TEXT,
    "deadlineTugas" TIMESTAMP(3),
    "fileJawaban" VARCHAR(255),

    CONSTRAINT "Tugas_pkey" PRIMARY KEY ("idTugas")
);

-- CreateTable
CREATE TABLE "Presensi" (
    "idPresensi" SERIAL NOT NULL,
    "nim" VARCHAR(20) NOT NULL,
    "idMataKuliah" INTEGER NOT NULL,
    "tanggalPertemuan" DATE,
    "statusKehadiran" "StatusKehadiran" DEFAULT 'Hadir',

    CONSTRAINT "Presensi_pkey" PRIMARY KEY ("idPresensi")
);

-- CreateTable
CREATE TABLE "ProgressTugas" (
    "idTugas" SERIAL NOT NULL,
    "idMataKuliah" INTEGER NOT NULL,
    "nim" VARCHAR(20) NOT NULL,
    "judul" VARCHAR(200),
    "detailTugas" TEXT,
    "deadlineTugas" TIMESTAMP(3),
    "fileJawaban" VARCHAR(255),

    CONSTRAINT "ProgressTugas_pkey" PRIMARY KEY ("idTugas")
);

-- CreateTable
CREATE TABLE "PengumpulanTugas" (
    "idPengumpulan" SERIAL NOT NULL,
    "idKelompok" INTEGER NOT NULL,
    "idTugas" INTEGER NOT NULL,
    "nim" VARCHAR(20) NOT NULL,
    "judul" VARCHAR(200),
    "detailTugas" TEXT,
    "deadlineTugas" TIMESTAMP(3),
    "fileJawaban" VARCHAR(255),

    CONSTRAINT "PengumpulanTugas_pkey" PRIMARY KEY ("idPengumpulan")
);

-- CreateIndex
CREATE UNIQUE INDEX "Mahasiswa_nomorInduk_key" ON "Mahasiswa"("nomorInduk");

-- CreateIndex
CREATE UNIQUE INDEX "Dosen_nomorInduk_key" ON "Dosen"("nomorInduk");

-- AddForeignKey
ALTER TABLE "Mahasiswa" ADD CONSTRAINT "Mahasiswa_nomorInduk_fkey" FOREIGN KEY ("nomorInduk") REFERENCES "User"("nomorInduk") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dosen" ADD CONSTRAINT "Dosen_nomorInduk_fkey" FOREIGN KEY ("nomorInduk") REFERENCES "User"("nomorInduk") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nilai" ADD CONSTRAINT "Nilai_nomorInduk_fkey" FOREIGN KEY ("nomorInduk") REFERENCES "User"("nomorInduk") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nilai" ADD CONSTRAINT "Nilai_idMataKuliah_fkey" FOREIGN KEY ("idMataKuliah") REFERENCES "MataKuliah"("idMataKuliah") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kuis" ADD CONSTRAINT "Kuis_idMataKuliah_fkey" FOREIGN KEY ("idMataKuliah") REFERENCES "MataKuliah"("idMataKuliah") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Soal" ADD CONSTRAINT "Soal_idKuis_fkey" FOREIGN KEY ("idKuis") REFERENCES "Kuis"("idKuis") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PilihanJawaban" ADD CONSTRAINT "PilihanJawaban_idSoal_fkey" FOREIGN KEY ("idSoal") REFERENCES "Soal"("idSoal") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumDiskusi" ADD CONSTRAINT "ForumDiskusi_idMataKuliah_fkey" FOREIGN KEY ("idMataKuliah") REFERENCES "MataKuliah"("idMataKuliah") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KomentarForum" ADD CONSTRAINT "KomentarForum_nomorInduk_fkey" FOREIGN KEY ("nomorInduk") REFERENCES "User"("nomorInduk") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KomentarForum" ADD CONSTRAINT "KomentarForum_idForum_fkey" FOREIGN KEY ("idForum") REFERENCES "ForumDiskusi"("idForumDiskusi") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModulAjar" ADD CONSTRAINT "ModulAjar_idMataKuliah_fkey" FOREIGN KEY ("idMataKuliah") REFERENCES "MataKuliah"("idMataKuliah") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kelompok" ADD CONSTRAINT "Kelompok_idMatakuliah_fkey" FOREIGN KEY ("idMatakuliah") REFERENCES "MataKuliah"("idMataKuliah") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tugas" ADD CONSTRAINT "Tugas_idMataKuliah_fkey" FOREIGN KEY ("idMataKuliah") REFERENCES "MataKuliah"("idMataKuliah") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tugas" ADD CONSTRAINT "Tugas_nim_fkey" FOREIGN KEY ("nim") REFERENCES "Mahasiswa"("nim") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presensi" ADD CONSTRAINT "Presensi_nim_fkey" FOREIGN KEY ("nim") REFERENCES "Mahasiswa"("nim") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presensi" ADD CONSTRAINT "Presensi_idMataKuliah_fkey" FOREIGN KEY ("idMataKuliah") REFERENCES "MataKuliah"("idMataKuliah") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressTugas" ADD CONSTRAINT "ProgressTugas_idMataKuliah_fkey" FOREIGN KEY ("idMataKuliah") REFERENCES "MataKuliah"("idMataKuliah") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressTugas" ADD CONSTRAINT "ProgressTugas_nim_fkey" FOREIGN KEY ("nim") REFERENCES "Mahasiswa"("nim") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PengumpulanTugas" ADD CONSTRAINT "PengumpulanTugas_idKelompok_fkey" FOREIGN KEY ("idKelompok") REFERENCES "Kelompok"("idKelompok") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PengumpulanTugas" ADD CONSTRAINT "PengumpulanTugas_idTugas_fkey" FOREIGN KEY ("idTugas") REFERENCES "Tugas"("idTugas") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PengumpulanTugas" ADD CONSTRAINT "PengumpulanTugas_nim_fkey" FOREIGN KEY ("nim") REFERENCES "Mahasiswa"("nim") ON DELETE RESTRICT ON UPDATE CASCADE;
