export class TugasGuru {
constructor({ idTugas, idMataKuliah, judul, detailTugas, deadlineTugas, tipe }) {
    this.idTugas = idTugas;
    this.idMataKuliah = idMataKuliah;
    this.judul = judul;
    this.detailTugas = detailTugas;
    this.deadlineTugas = deadlineTugas;
    this.tipe = tipe; // Individu, Kelompok, Kuis
}

isValid() {
    if (!this.judul || !this.deadlineTugas) {
        throw new Error("Judul dan deadline wajib diisi.");
    }
    return true;
    }
}