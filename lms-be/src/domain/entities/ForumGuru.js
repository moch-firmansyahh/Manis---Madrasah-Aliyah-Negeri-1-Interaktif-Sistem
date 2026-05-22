export class ForumGuru {
constructor({ judul, isiForum, idMataKuliah }) {
    this.judul = judul;
    this.isiForum = isiForum;
    this.idMataKuliah = idMataKuliah;
}

validate() {
    if (!this.judul || this.judul.trim() === "") {
        throw new Error("Judul diskusi tidak boleh kosong");
    }
    if (!this.isiForum || this.isiForum.trim() === "") {
        throw new Error("Isi diskusi tidak boleh kosong");
    }
    if (!this.idMataKuliah) {
        throw new Error("ID Mata Kuliah harus disertakan");
        }
    }
}