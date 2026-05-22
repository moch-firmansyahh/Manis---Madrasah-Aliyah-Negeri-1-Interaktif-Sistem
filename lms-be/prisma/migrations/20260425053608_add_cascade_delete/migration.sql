-- DropForeignKey
ALTER TABLE "Dosen" DROP CONSTRAINT "Dosen_nomorInduk_fkey";

-- DropForeignKey
ALTER TABLE "Mahasiswa" DROP CONSTRAINT "Mahasiswa_nomorInduk_fkey";

-- AddForeignKey
ALTER TABLE "Mahasiswa" ADD CONSTRAINT "Mahasiswa_nomorInduk_fkey" FOREIGN KEY ("nomorInduk") REFERENCES "User"("nomorInduk") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dosen" ADD CONSTRAINT "Dosen_nomorInduk_fkey" FOREIGN KEY ("nomorInduk") REFERENCES "User"("nomorInduk") ON DELETE CASCADE ON UPDATE CASCADE;
