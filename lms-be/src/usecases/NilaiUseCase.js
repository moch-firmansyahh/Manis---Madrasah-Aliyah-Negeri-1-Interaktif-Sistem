export class NilaiUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async inputNilai(data) {
    if (!data.nomorInduk || !data.idMataKuliah) {
      throw new Error("Nomor Induk dan ID Mata Kuliah wajib diisi");
    }

    const nilaiTugas = parseFloat(data.nilaiTugas || 0);
    const nilaiKuis = parseFloat(data.nilaiKuis || 0);

    if (isNaN(nilaiTugas) || isNaN(nilaiKuis)) {
      throw new Error("Nilai harus berupa angka yang valid");
    }

    if (nilaiTugas < 0 || nilaiTugas > 100 || nilaiKuis < 0 || nilaiKuis > 100) {
      throw new Error("Nilai harus antara 0-100");
    }

    // Hitung nilai akhir: tugas 30%, kuis 30%, final/belum ada = 40% atau hitung rata-rata
    const nilaiAkhir = (nilaiTugas * 0.3 + nilaiKuis * 0.3 + ((data.nilaiAkhir || (nilaiTugas + nilaiKuis) / 2) * 0.4));

    return await this.repository.create({
      ...data,
      nilaiAkhir: data.nilaiAkhir || (nilaiTugas + nilaiKuis) / 2
    });
  }

  async getNilaiMahasiswa(nomorInduk, idMataKuliah) {
    if (idMataKuliah) {
      return await this.repository.findByMahasiswaAndMataKuliah(nomorInduk, parseInt(idMataKuliah));
    }
    return await this.repository.findByMahasiswa(nomorInduk);
  }

  async getAllNilai() {
    return await this.repository.findAll();
  }

  async getNilaiByMataKuliah(idMataKuliah) {
    const allNilai = await this.repository.findAll();
    return allNilai.filter(n => n.idMataKuliah === parseInt(idMataKuliah));
  }

  async updateNilai(id, updateData) {
    const existingNilai = await this.repository.findById(id);
    if (!existingNilai) throw new Error("Data nilai tidak ditemukan");

    const finalUpdateData = { ...updateData };
    const nTugas = updateData.nilaiTugas !== undefined ? updateData.nilaiTugas : existingNilai.nilaiTugas;
    const nKuis = updateData.nilaiKuis !== undefined ? updateData.nilaiKuis : existingNilai.nilaiKuis;
    
    const parsedTugas = parseFloat(nTugas);
    const parsedKuis = parseFloat(nKuis);

    if (isNaN(parsedTugas) || isNaN(parsedKuis)) {
      throw new Error("Nilai harus berupa angka yang valid");
    }

    if (parsedTugas < 0 || parsedTugas > 100 || parsedKuis < 0 || parsedKuis > 100) {
      throw new Error("Nilai harus antara 0-100");
    }

    finalUpdateData.nilaiAkhir = (parsedTugas + parsedKuis) / 2;
    return await this.repository.update(id, finalUpdateData);
  }

  async getPengumpulanIndividu(idMataKuliah) {
    const data = await this.repository.getPengumpulanIndividu(idMataKuliah);
    
    const result = await Promise.all(data.map(async (p) => {
      // Skip yang punya idKelompok (itu tugas kelompok)
      if (p.idKelompok) return null;
      
      const nomorIndukMahasiswa = p.mahasiswa?.user?.nomorInduk;
      const idMkTugas = p.tugas?.idMataKuliah;
      
      let nilai = null;
      if (nomorIndukMahasiswa) {
        nilai = await this.repository.getNilaiTugas(nomorIndukMahasiswa, idMkTugas || idMataKuliah);
      }
      
      return {
        idPengumpulan: p.idPengumpulan,
        nim: p.nim,
        nama: p.mahasiswa?.user?.nama || "Mahasiswa",
        nomorInduk: nomorIndukMahasiswa,
        idMataKuliah: idMkTugas || idMataKuliah,
        tugas: {
          id: p.tugas?.idTugas,
          judul: p.tugas?.judul || p.judul,
          deadline: p.deadlineTugas
        },
        fileJawaban: p.fileJawaban,
        tanggalKumpul: p.createdAt || p.deadlineTugas,
        nilai: nilai?.nilaiTugas !== undefined && nilai?.nilaiTugas !== null ? parseFloat(nilai.nilaiTugas) : null,
        idNilai: nilai?.idNilai || null
      };
    }));
    
    // Filter out null values (kelompok submissions)
    return result.filter(r => r !== null);
  }

  async getTugasByMataKuliah(idMataKuliah) {
    const tugas = await this.repository.getTugasByMataKuliah(idMataKuliah);
    return tugas.map(t => ({
      idTugas: t.idTugas,
      judul: t.judul,
      deadlineTugas: t.deadlineTugas ? t.deadlineTugas.toISOString() : null,
      tipeTugas: t.tipeTugas || 'Individu'
    }));
  }

  async getPengumpulanPerTugas(idTugas, idMataKuliah) {
    // Ambil semua mahasiswa di matkul ini
    const semuaMahasiswa = await this.repository.getMahasiswaByMataKuliah(idMataKuliah);
    // Ambil yang sudah submit
    const submissions = await this.repository.getPengumpulanPerTugas(idTugas);
    const submissionMap = new Map(submissions.map(s => [s.nim, s]));

    return semuaMahasiswa.map(mhs => {
      const sub = submissionMap.get(mhs.nim);
      return {
        nim: mhs.nim,
        nomorInduk: mhs.user?.nomorInduk || mhs.nim,
        nama: mhs.user?.nama || 'Mahasiswa',
        sudahKumpul: !!sub,
        idPengumpulan: sub?.idPengumpulan || null,
        fileJawaban: sub?.fileJawaban || null,
        tanggalKumpul: sub?.deadlineTugas || null,
        nilai: null
      };
    });
  }

  async saveNilaiTugas(data) {
    const { nomorInduk, idMataKuliah, nilaiTugas } = data;
    
    if (!nomorInduk || !idMataKuliah || nilaiTugas === undefined) {
      throw new Error("Data tidak lengkap");
    }
    
    const nilai = parseFloat(nilaiTugas);
    if (isNaN(nilai) || nilai < 0 || nilai > 100) {
      throw new Error("Nilai harus antara 0-100");
    }
    
    return await this.repository.upsertNilaiTugas(nomorInduk, idMataKuliah, nilai);
  }
}