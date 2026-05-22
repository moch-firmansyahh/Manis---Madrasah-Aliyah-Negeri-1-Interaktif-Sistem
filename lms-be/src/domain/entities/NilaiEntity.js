export class Nilai {
  constructor({ idNilai, nomorInduk, idMataKuliah, nilaiTugas, nilaiKuis, nilaiAkhir }) {
    this.idNilai = idNilai;
    this.nomorInduk = nomorInduk;
    this.idMataKuliah = idMataKuliah;
    this.nilaiTugas = nilaiTugas;
    this.nilaiKuis = nilaiKuis;
    this.nilaiAkhir = nilaiAkhir;
  }

  // Contoh logika: Nilai Akhir adalah rata-rata (bisa disesuaikan bobotnya)
  calculateFinalScore() {
    const tugas = parseFloat(this.nilaiTugas) || 0;
    const kuis = parseFloat(this.nilaiKuis) || 0;
    return (tugas + kuis) / 2;
  }
}