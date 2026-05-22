export class DashboardGuruUseCase {
  constructor(guruRepository) {
    this.guruRepository = guruRepository;
  }

  async getDashboardData(nomorInduk) {
    const guru = await this.guruRepository.getGuruInfo(nomorInduk);
    if (!guru) throw new Error("Data guru tidak ditemukan");

    const nip = guru.nip;

    // Ambil semua data secara paralel agar respons API lebih cepat
    const [materiList, totalSiswa, submissionStats] = await Promise.all([
      this.guruRepository.getMateriList(nip),
      this.guruRepository.getTotalSiswa(nip),
      this.guruRepository.getSubmissionStats(nip)
    ]);

    // Format daftar materi
    const formattedMateri = (materiList || []).map(m => ({
      id: m.idModulAjar,
      judul: m.judul,
      tipe: m.tipe_modul || "Dokumen",
      mataKuliah: m.mataKuliah?.namaMataKuliah || "-",
      tanggal: m.tanggal ? new Date(m.tanggal).toLocaleDateString('id-ID') : "-",
      ukuran: m.ukuran || "-"
    }));

    return {
      lecturerName: guru?.user?.nama || "Guru",
      stats: {
        totalSiswa: totalSiswa || 0,
        tugasIndividu: submissionStats?.individu || 0,
        tugasKelompok: submissionStats?.kelompok || 0
      },
      daftarMateri: formattedMateri
    };
  }
}