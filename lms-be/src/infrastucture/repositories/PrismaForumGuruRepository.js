import { prisma } from "../../prismaClient.js";
export class PrismaForumGuruRepository {
async getThreadsByMataKuliah(idMataKuliah) {
    return await prisma.forumDiskusi.findMany({
        where: { idMataKuliah: parseInt(idMataKuliah) },
        orderBy: { createdAt: 'desc' },
        include: {
        user: {
            select: { nama: true, role: { select: { nama: true } } }
        },
        _count: { select: { komentarForum: true, likes: true } },
        komentarForum: {
            include: { user: true },
            orderBy: { createdAt: 'asc' }
        },
        likes: true 
        }
    });
}

async createThread(data) {
    return await prisma.forumDiskusi.create({
        data: {
            idMataKuliah: parseInt(data.idMataKuliah),
            nomorInduk: data.nomorInduk,
            judul: data.judul,
            isiForum: data.isiForum,
            lampiran: data.lampiran || null
        },
        include: {
            user: {
                select: { nama: true, role: { select: { nama: true } } }
            }
        }
    });
}

async addReply(idForum, nomorInduk, isiKomentar) {
    return await prisma.komentarForum.create({
        data: {
            idForum: parseInt(idForum),
            nomorInduk,
            isiKomentar
        },
        include: { user: true }
    });
}

async toggleLike(idForum, nomorInduk) {
    const existingLike = await prisma.likeForum.findUnique({
        where: {
        nomorInduk_idForum: { nomorInduk, idForum: parseInt(idForum) }
        }
    });

    if (existingLike) {
        await prisma.likeForum.delete({ where: { idLike: existingLike.idLike } });
        return { liked: false };
    } else {
        await prisma.likeForum.create({
            data: { nomorInduk, idForum: parseInt(idForum) }
        });
        return { liked: true };
    }
}
}