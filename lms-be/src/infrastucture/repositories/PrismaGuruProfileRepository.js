import { prisma } from '../../prismaClient.js';
export class PrismaGuruProfileRepository {
async getProfile(nomorInduk) {
    return await prisma.user.findUnique({
        where: { nomorInduk },
        include: {
            guru: true,
        },
    });
}

async updateProfile(nomorInduk, data) {
    // Memperbarui User (email, telepon) dan Guru (bidang, ruangKantor) sekaligus
    return await prisma.user.update({
        where: { nomorInduk },
        data: {
        email: data.email,
        telepon: data.telepon,
        guru: {
            update: {
            bidang: data.bidang,
            ruangKantor: data.officeRoom,
            }
        }
    },
        include: { guru: true }
    });
}

async updatePassword(nomorInduk, newHashedPassword) {
    return await prisma.user.update({
        where: { nomorInduk },
        data: { password: newHashedPassword }
    });
    }
}