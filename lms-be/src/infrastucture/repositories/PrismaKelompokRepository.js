import { prisma } from "../../prismaClient.js";

export class PrismaKelompokRepository {
  async findAll(nipGuru) {
      const whereClause = nipGuru ? {
          mataKuliah: { nipGuru: nipGuru }
      } : {};
      return await prisma.kelompok.findMany({
          where: whereClause,
          include: {
              mataKuliah: { select: { namaMataKuliah: true } },
              anggota: {
                  include: {
                      siswa: {
                          include: { user: true }
                      }
                  }
              },
              pengumpulan: {
                  orderBy: { idPengumpulan: 'desc' }
              }
          }
      });
  }

  async findByMataKuliah(idMataKuliah) {
      return await prisma.kelompok.findMany({
          where: { idMataKuliah: parseInt(idMataKuliah) },
          include: {
              anggota: {
                  include: {
                      siswa: {
                          include: { user: true }
                      }
                  }
              },
              pengumpulan: {
                  orderBy: { idPengumpulan: 'desc' }
              }
          }
      });
  }

  async createKelompok(data) {
      return await prisma.kelompok.create({
          data: {
              namaKelompok: data.name,
              warna: data.color || "#4b53bc",
              tugasName: data.task || null,
              progress: data.progress || 0,
              status: data.status || "Not Started",
              submitted: data.submitted || false,
              idMataKuliah: parseInt(data.idMataKuliah)
          }
      });
  }

  async addMember(idKelompok, nis) {
      try {
          const targetKelompok = await prisma.kelompok.findUnique({
              where: { idKelompok: parseInt(idKelompok) },
              select: { idMataKuliah: true, namaKelompok: true }
          });
          if (targetKelompok) {
              const existingKelompok = await prisma.anggotaKelompok.findFirst({
                  where: {
                      nis: nis,
                      kelompok: { idMataKuliah: targetKelompok.idMataKuliah }
                  },
                  include: { kelompok: { select: { namaKelompok: true } } }
              });
              if (existingKelompok) {
                  throw new Error(`Siswa sudah tergabung di kelompok "${existingKelompok.kelompok.namaKelompok}" untuk mata kuliah ini`);
              }
          }

          return await prisma.anggotaKelompok.create({
              data: {
                  idKelompok: parseInt(idKelompok),
                  nis: nis
              }
          });
      } catch (error) {
          if (error.code === 'P2002') {
              throw new Error("Anggota sudah ada di kelompok ini");
          }
          throw error;
      }
  }

  async removeMember(idKelompok, nis) {
      return await prisma.anggotaKelompok.delete({
          where: {
              idKelompok_nis: {
                  idKelompok: parseInt(idKelompok),
                  nis: nis
              }
          }
      });
  }

  async findAllSiswa() {
      return await prisma.siswa.findMany({
          include: { user: { select: { nama: true, nomorInduk: true } } }
      });
  }

  async updateGrades(idKelompok, gradesObj) {
      const updates = Object.entries(gradesObj).map(([nis, nilai]) => {
          return prisma.anggotaKelompok.update({
              where: { idKelompok_nis: { idKelompok: parseInt(idKelompok), nis: nis } },
              data: { nilaiTugas: nilai === "" ? null : parseFloat(nilai) }
          });
      });
      return await prisma.$transaction(updates);
  }

  async deleteKelompok(idKelompok) {
      return await prisma.kelompok.delete({
          where: { idKelompok: parseInt(idKelompok) }
      });
  }
}