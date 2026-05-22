import { ForumGuru } from '../domain/entities/ForumGuru.js';

export class GuruForumUseCase {
constructor(forumRepository) {
    this.forumRepository = forumRepository;
}

async getThreads(idMataKuliah, nomorIndukUser) {
    const threads = await this.forumRepository.getThreadsByMataKuliah(idMataKuliah);
    
    // Mapping data agar sesuai dengan struktur INITIAL_THREADS di frontend Anda
    return threads.map(thread => ({
        id: thread.idForumDiskusi,
        authorName: thread.user?.nama || "Unknown",
        authorRole: thread.user?.role?.nama || null,
        time: thread.createdAt,
        title: thread.judul,
        content: thread.isiForum,
        likes: thread._count.likes,
        liked: thread.likes.some(like => like.nomorInduk === nomorIndukUser),
        replyCount: thread._count.komentarForum,
        lampiran: thread.lampiran,
        replies: thread.komentarForum.map(reply => ({
        id: reply.idKomentar,
        authorName: reply.user.nama,
        time: reply.createdAt,
        content: reply.isiKomentar,
        }))
    }));
}

async createNewThread(data) {
    const forumEntity = new ForumGuru(data);
    forumEntity.validate();
    return await this.forumRepository.createThread(data);
}

async replyToThread(idForum, nomorInduk, isiKomentar) {
    if (!isiKomentar || isiKomentar.trim() === "") throw new Error("Balasan tidak boleh kosong");
    return await this.forumRepository.addReply(idForum, nomorInduk, isiKomentar);
}

async toggleLike(idForum, nomorInduk) {
    return await this.forumRepository.toggleLike(idForum, nomorInduk);
}
}