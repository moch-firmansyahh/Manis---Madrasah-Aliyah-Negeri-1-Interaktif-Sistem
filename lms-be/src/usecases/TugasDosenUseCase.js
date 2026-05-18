import { TugasDosen } from '../domain/entities/TugasDosen.js';

export class TugasDosenUseCase {
constructor(tugasRepository, mataKuliahRepository) {
    this.tugasRepository = tugasRepository;
    this.mataKuliahRepository = mataKuliahRepository;
}

async getDaftarTugas(dosenIdMataKuliahList) {
    // Jika tidak diberi list, pakai semua mata kuliah
    let idList = dosenIdMataKuliahList;
    if ((!idList || idList.length === 0) && this.mataKuliahRepository) {
        const all = await this.mataKuliahRepository.findAll();
        idList = all.map(m => m.idMataKuliah);
    }
    if (!idList || idList.length === 0) return [];

    const rawData = await this.tugasRepository.findAllByDosen(idList);

    // FIX: rawData adalah { tugas, kuis }
    const tugasList = rawData.tugas || [];
    const kuisList = rawData.kuis || [];

    // Format tugas
    const formatTugas = tugasList.map(t => ({
        id: t.idTugas,
        tipe: 'Tugas',
        title: t.judul,
        matkul: t.mataKuliah?.namaMataKuliah || 'Unknown',
        idMataKuliah: t.idMataKuliah,
        desc: t.detailTugas || '',
        type: t.tipeTugas || 'Individu',
        deadline: t.deadlineTugas ? t.deadlineTugas.toISOString() : null,
        submitted: t.pengumpulanTugas ? t.pengumpulanTugas.length : 0,
        total: t._totalMahasiswa || 10,
        status: t.deadlineTugas && new Date(t.deadlineTugas) < new Date() ? 'Selesai' : 'Aktif',
        // File info
        fileTugas: t.fileTugas || null,
        namaFileTugas: t.namaFileTugas || null,
        tipeFileTugas: t.tipeFileTugas || null,
        ukuranFile: t.ukuranFile || null
    }));

    // Format kuis
    const formatKuis = kuisList.map(k => ({
        id: k.idKuis,
        tipe: 'Kuis',
        title: k.judul,
        matkul: k.mataKuliah?.namaMataKuliah || 'Unknown',
        idMataKuliah: k.idMataKuliah,
        desc: '',
        type: 'Kuis',
        deadline: k.deadlineKuis ? k.deadlineKuis.toISOString() : null,
        submitted: k.jumlahPengerjaan || 0,
        total: k.totalMahasiswa || 0,
        jumlahPengerjaan: k.jumlahPengerjaan || 0,
        totalMahasiswa: k.totalMahasiswa || 0,
        status: k.deadlineKuis && new Date(k.deadlineKuis) < new Date() ? 'Selesai' : 'Aktif'
    }));

    return [...formatTugas, ...formatKuis];
}

async createTugasAtauKuis(payload) {
    const tugas = new TugasDosen(payload);
    tugas.isValid();

    if (payload.tipe === 'Kuis') {
        return await this.tugasRepository.createKuis(payload, payload.quizData || []);
    } else {
        return await this.tugasRepository.createTugas(payload);
    }
}

async updateTugas(id, payload) {
    return await this.tugasRepository.updateTugas(id, payload);
}

async deleteTugas(id) {
    // Cek dulu apakah itu tugas atau kuis
    try {
        return await this.tugasRepository.deleteTugas(id);
    } catch (e) {
        // Jika tidak ada di tugas, coba hapus kuis
        throw e;
    }
}

async gradeTugas(grades) {
    // Format input { "1301210001": 80, "1301210002": 90 }
    const gradesData = Object.entries(grades.gradeInputs || {}).map(([nomorInduk, nilai]) => ({
        nomorInduk,
        idMataKuliah: grades.idMataKuliah,
        nilaiTugas: nilai
    }));
    return await this.tugasRepository.saveGrades(gradesData);
    }
}