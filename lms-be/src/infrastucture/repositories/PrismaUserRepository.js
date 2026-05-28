import { prisma } from "../../prismaClient.js";

export class PrismaUserRepository {
  async create(user) {
    return await prisma.user.create({ data: user });
  }

  // Menghitung jumlah user berdasarkan role untuk menentukan urutan ID
  async countByRoleId(roleId) {
    return await prisma.user.count({
      where: { roleId }
    });
  }

  // Menghitung jumlah siswa untuk menentukan urutan NIS
  async countSiswa() {
    return await prisma.siswa.count();
  }

  async createWithProfile(userData, profileData, roleType) {
    try {
      return await prisma.$transaction(async (tx) => {
        // 1. Buat User utama
        const user = await tx.user.create({ data: userData });

        // 2. Buat Profil berdasarkan Role
        if (roleType === 'SISWA') {
          await tx.siswa.create({
            data: {
              nis: profileData.nis,
              nomorInduk: user.nomorInduk
            }
          });
        } else if (roleType === 'GURU') {
          await tx.guru.create({
            data: {
              nip: profileData.nip,
              nomorInduk: user.nomorInduk
            }
          });
        }

        return user;
      });
    } catch (error) {
      // Handle specific database errors
      if (error.code === 'P2002') {
        // Unique constraint violation
        const field = error.meta?.target?.[0] || 'field';
        throw new Error(`${field} sudah terdaftar dalam sistem`);
      }
      if (error.code === 'P2003') {
        // Foreign key constraint violation
        throw new Error("Role atau data referensi tidak ditemukan");
      }
      throw error;
    }
  }

  async findRoleById(roleId) {
    return await prisma.role.findUnique({ where: { id: roleId } });
  }

  async findAllRoles() {
    return await prisma.role.findMany();
  }

  async findAll() {
    return await prisma.user.findMany();
  }

  async findByNomorInduk(nomorInduk) {
    return await prisma.user.findUnique({
      where: { nomorInduk },
      include: { role: true, guru: true, siswa: true }
    });
  }

  async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
      include: { role: true, guru: true, siswa: true }
    });
  }

  async findByNis(nis) {
    const siswa = await prisma.siswa.findUnique({
      where: { nis },
      include: {
        user: {
          include: { role: true }
        }
      }
    });
    if (siswa && siswa.user) {
      const { user, ...siswaData } = siswa;
      siswa.user.siswa = siswaData;
      return siswa.user;
    }
    return null;
  }

  async findByNip(nip) {
    const guru = await prisma.guru.findUnique({
      where: { nip },
      include: {
        user: {
          include: { role: true }
        }
      }
    });
    if (guru && guru.user) {
      const { user, ...guruData } = guru;
      guru.user.guru = guruData;
      return guru.user;
    }
    return null;
  }

  async update(nomorInduk, data) {
    return await prisma.user.update({
      where: { nomorInduk },
      data: data,
      include: {
        role: true, // Kembalikan info role setelah update
        siswa: true,
        guru: true
      }
    });
  }

  async delete(nomorInduk) {
    return await prisma.user.delete({
      where: { nomorInduk }
    });
  }
}