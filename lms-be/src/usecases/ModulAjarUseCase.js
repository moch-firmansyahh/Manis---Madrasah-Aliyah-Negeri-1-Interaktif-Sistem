import { ModulAjar } from '../domain/entities/ModulAjar.js';

export class ModulAjarUseCase {
constructor(modulAjarRepository) {
    this.repository = modulAjarRepository;
}

async getMateri(filterMatkul, filterTipe, nipGuru, idKelas) {
    const materiData = await this.repository.findAllByGuru(filterMatkul, filterTipe, nipGuru, idKelas);
    // Format response agar sesuai dengan kebutuhan UI React
    return materiData.map(m => ({
        id: m.idModulAjar,
        judul: m.judul,
        tipe: m.tipe_modul,
        matkul: m.idMataKuliah,
        matakuliah: m.mataKuliah?.namaMataKuliah || "Unknown",
        deskripsi: m.deskripsi,
        url: m.url || m.fileUrl,
        ukuran: m.ukuran,
        tanggal: m.tanggal ? new Date(m.tanggal).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        diunduh: m.diunduh,
        canDownload: m.canDownload
    }));
}

async createMateri(data, file) {
    const modul = new ModulAjar(data);
    if (!modul.isValid()) throw new Error("Data materi tidak valid atau tidak lengkap.");
    
    if (file) {
        data.fileUrl = `/uploads/${file.filename}`;
        data.ukuran = `${(file.size / 1024 / 1024).toFixed(1)} MB`;
    }

    return await this.repository.create(data);
}

async updateMateri(id, data) {
    return await this.repository.update(id, data);
}

async deleteMateri(id) {
    return await this.repository.delete(id);
}

async downloadMateri(id) {
    return await this.repository.incrementDownload(id);
}
}