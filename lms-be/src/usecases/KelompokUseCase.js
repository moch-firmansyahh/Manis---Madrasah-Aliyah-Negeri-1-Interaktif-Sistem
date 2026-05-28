export class KelompokUseCase {
constructor(kelompokRepository) {
    this.kelompokRepository = kelompokRepository;
}

async getDaftarKelompok(idMataKuliah) {
    const kelompokData = await this.kelompokRepository.findByMataKuliah(idMataKuliah);
    
    return kelompokData.map(k => {
        const membersArr = [];
        const nilaiObj = {};
        k.anggota.forEach(ang => {
            membersArr.push({
                nis: ang.nis,
                name: ang.siswa?.user?.nama || "Siswa",
                nomorInduk: ang.siswa?.nomorInduk || ang.nis
            });
            nilaiObj[ang.nis] = ang.nilaiTugas ? ang.nilaiTugas.toString() : "";
        });

        const lastSubmission = k.pengumpulan?.[0] || null;
        const totalAnggota = k.anggota.length;
        const nisSudahSubmit = new Set((k.pengumpulan || []).map(p => p.nis));
        const sudahSubmit = k.anggota.filter(a => nisSudahSubmit.has(a.nis)).length;
        const progress = totalAnggota > 0 ? Math.round((sudahSubmit / totalAnggota) * 100) : 0;
        return {
            id: k.idKelompok,
            name: k.namaKelompok,
            color: k.warna || "#4b53bc",
            task: k.tugasName || "–",
            progress,
            status: k.status,
            submitted: lastSubmission !== null,
            fileKumpulan: lastSubmission?.fileJawaban || null,
            judulKumpulan: lastSubmission?.judul || null,
            members: membersArr,
            nilai: nilaiObj
        };
    });
}

async createNewGroup(data) {
    if (!data.name || !data.idMataKuliah) throw new Error("Nama kelompok dan ID Mata Kuliah wajib diisi");
    return await this.kelompokRepository.createKelompok(data);
}

async addMember(idKelompok, nis) {
    return await this.kelompokRepository.addMember(idKelompok, nis);
}

async removeMember(idKelompok, nis) {
    return await this.kelompokRepository.removeMember(idKelompok, nis);
}

async saveGrades(idKelompok, grades) {
    return await this.kelompokRepository.updateGrades(idKelompok, grades);
}

async getAllKelompok(nipGuru, idKelas) {
    const kelompokData = await this.kelompokRepository.findAll(nipGuru, idKelas);
    
    return kelompokData.map(k => {
        const membersArr = [];
        const nilaiObj = {};
        k.anggota.forEach(ang => {
            membersArr.push({
                nis: ang.nis,
                name: ang.siswa?.user?.nama || "Siswa",
                nomorInduk: ang.siswa?.nomorInduk || ang.nis
            });
            nilaiObj[ang.nis] = ang.nilaiTugas ? ang.nilaiTugas.toString() : "";
        });

        const lastSubmission = k.pengumpulan?.[0] || null;
        const totalAnggota = k.anggota.length;
        const nisSudahSubmit = new Set((k.pengumpulan || []).map(p => p.nis));
        const sudahSubmit = k.anggota.filter(a => nisSudahSubmit.has(a.nis)).length;
        const progress = totalAnggota > 0 ? Math.round((sudahSubmit / totalAnggota) * 100) : 0;
        return {
            id: k.idKelompok,
            name: k.namaKelompok,
            color: k.warna || "#4b53bc",
            task: k.tugasName || "–",
            progress,
            status: k.status,
            submitted: lastSubmission !== null,
            fileKumpulan: lastSubmission?.fileJawaban || null,
            judulKumpulan: lastSubmission?.judul || null,
            idMataKuliah: k.idMataKuliah,
            mataKuliahName: k.mataKuliah?.namaMataKuliah || "-",
            members: membersArr,
            nilai: nilaiObj
        };
    });
}

async getAllSiswa() {
    const data = await this.kelompokRepository.findAllSiswa();
    return data.map(m => ({
        nis: m.nis,
        name: m.user?.nama || "Siswa",
        nomorInduk: m.user?.nomorInduk || m.nis
    }));
}

async deleteKelompok(idKelompok) {
    return await this.kelompokRepository.deleteKelompok(idKelompok);
}
}