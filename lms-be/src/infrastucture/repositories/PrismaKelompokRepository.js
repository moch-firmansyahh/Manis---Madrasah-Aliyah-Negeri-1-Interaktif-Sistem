import { prisma } from "../../../lib/prisma.ts";

export class PrismaKelompokRepository {
async findAll(nipDosen) {
    const whereClause = nipDosen ? {
        mataKuliah: { nipDosen: nipDosen }
    } : {};
    return await prisma.kelompok.findMany({
        where: whereClause,
        include: {
            mataKuliah: { select: { namaMataKuliah: true } },
            anggota: {
                include: {
                    mahasiswa: {
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
                    mahasiswa: {
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

async addMember(idKelompok, nim) {
    try {
        // Cek apakah mahasiswa sudah ada di kelompok lain dalam matkul yang sama
        const targetKelompok = await prisma.kelompok.findUnique({
            where: { idKelompok: parseInt(idKelompok) },
            select: { idMataKuliah: true, namaKelompok: true }
        });
        if (targetKelompok) {
            const existingKelompok = await prisma.anggotaKelompok.findFirst({
                where: {
                    nim: nim,
                    kelompok: { idMataKuliah: targetKelompok.idMataKuliah }
                },
                include: { kelompok: { select: { namaKelompok: true } } }
            });
            if (existingKelompok) {
                throw new Error(`Mahasiswa sudah tergabung di kelompok "${existingKelompok.kelompok.namaKelompok}" untuk mata kuliah ini`);
            }
        }

        return await prisma.anggotaKelompok.create({
            data: {
                idKelompok: parseInt(idKelompok),
                nim: nim
            }
        });
    } catch (error) {
        if (error.code === 'P2002') {
            throw new Error("Anggota sudah ada di kelompok ini");
        }
        throw error;
    }
}

async removeMember(idKelompok, nim) {
    return await prisma.anggotaKelompok.delete({
        where: {
            idKelompok_nim: {
                idKelompok: parseInt(idKelompok),
                nim: nim
            }
        }
    });
}

async findAllMahasiswa() {
    return await prisma.mahasiswa.findMany({
        include: { user: { select: { nama: true, nomorInduk: true } } }
    });
}

async updateGrades(idKelompok, gradesObj) {
    const updates = Object.entries(gradesObj).map(([nim, nilai]) => {
        return prisma.anggotaKelompok.update({
            where: { idKelompok_nim: { idKelompok: parseInt(idKelompok), nim: nim } },
            data: { nilaiTugas: nilai === "" ? null : parseFloat(nilai) }
        });
    });
    return await prisma.$transaction(updates);
}
}