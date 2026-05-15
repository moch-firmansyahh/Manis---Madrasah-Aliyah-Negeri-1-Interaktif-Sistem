export class TugasUseCase {
  constructor(tugasRepository) {
    this.tugasRepository = tugasRepository;
  }

  async getDaftarTugas(filter = {}) {
    const tugasList = await this.tugasRepository.findAllTugas(filter);
    return tugasList.map(t => {
      const userSubmission = t.pengumpulanTugas && t.pengumpulanTugas.length > 0 ? t.pengumpulanTugas[0] : null;
      return {
        id: t.idTugas,
        idMataKuliah: t.idMataKuliah,
        judul: t.judul,
        detailTugas: t.detailTugas,
        deadlineTugas: t.deadlineTugas ? t.deadlineTugas.toISOString() : null,
        mataKuliah: t.mataKuliah ? t.mataKuliah.namaMataKuliah : "Unknown",
        sudahKumpul: !!userSubmission,
        fileJawaban: userSubmission?.fileJawaban || null,
        // File tugas dari dosen (lampiran soal/instruksi)
        fileTugas: t.fileTugas || null,
        namaFileTugas: t.namaFileTugas || null,
        tipeFileTugas: t.tipeFileTugas || null,
        ukuranFile: t.ukuranFile || null
      };
    });
  }

  async getDetailTugas(idTugas, nim) {
    const tugas = await this.tugasRepository.findTugasById(idTugas);
    if (!tugas) throw new Error("Tugas tidak ditemukan");

    const existingSubmission = await this.tugasRepository.findPengumpulanByNimAndTugas(nim, idTugas);

    return {
      id: tugas.idTugas,
      idMataKuliah: tugas.idMataKuliah,
      judul: tugas.judul,
      detailTugas: tugas.detailTugas,
      deadlineTugas: tugas.deadlineTugas ? tugas.deadlineTugas.toISOString() : null,
      mataKuliah: tugas.mataKuliah ? tugas.mataKuliah.namaMataKuliah : "Unknown",
      sudahKumpul: !!existingSubmission,
      pengumpulan: existingSubmission ? {
        idPengumpulan: existingSubmission.idPengumpulan,
        fileJawaban: existingSubmission.fileJawaban,
        tanggalKumpul: existingSubmission.deadlineTugas
      } : null,
      // File tugas dari dosen (lampiran soal/instruksi)
      fileTugas: tugas.fileTugas || null,
      namaFileTugas: tugas.namaFileTugas || null,
      tipeFileTugas: tugas.tipeFileTugas || null,
      ukuranFile: tugas.ukuranFile || null
    };
  }

  async kumpulTugas(payload) {
    const { idTugas, nim, judul, detailTugas, fileJawaban } = payload;

    const tugas = await this.tugasRepository.findTugasById(idTugas);
    if (!tugas) throw new Error("Tugas tidak ditemukan");

    // Cek apakah mahasiswa ini punya kelompok di matkul yang sama
    // Tapi hanya pakai kelompok kalau tipeTugas bukan Individu
    const isIndividu = (tugas.tipeTugas || 'Individu') === 'Individu';
    const anggotaKelompok = isIndividu ? null : await this.tugasRepository.findKelompokByNim(nim, tugas.idMataKuliah);
    const kelompok = anggotaKelompok?.kelompok;

    if (kelompok) {
      // Submit untuk semua anggota kelompok
      const semuaAnggota = kelompok.anggota.map(a => a.nim);
      const results = await Promise.all(semuaAnggota.map(async (anggotaNim) => {
        const existing = await this.tugasRepository.findPengumpulanByNimAndTugas(anggotaNim, idTugas);
        if (existing) {
          return await this.tugasRepository.updatePengumpulan(existing.idPengumpulan, {
            judul: judul || tugas.judul,
            detailTugas: detailTugas || "",
            fileJawaban
          });
        }
        return await this.tugasRepository.createPengumpulan({
          idTugas,
          nim: anggotaNim,
          judul: judul || tugas.judul,
          detailTugas: detailTugas || "",
          fileJawaban,
          deadlineTugas: tugas.deadlineTugas,
          idKelompok: kelompok.idKelompok
        });
      }));
      // Kembalikan pengumpulan milik yang submit
      return results.find(r => r.nim === nim) || results[0];
    }

    // Tidak ada kelompok — submit individu seperti biasa
    const existing = await this.tugasRepository.findPengumpulanByNimAndTugas(nim, idTugas);
    if (existing) {
      return await this.tugasRepository.updatePengumpulan(existing.idPengumpulan, {
        judul,
        detailTugas,
        fileJawaban
      });
    }

    return await this.tugasRepository.createPengumpulan({
      idTugas,
      nim,
      judul: judul || tugas.judul,
      detailTugas: detailTugas || "",
      fileJawaban,
      deadlineTugas: tugas.deadlineTugas
    });
  }
}
