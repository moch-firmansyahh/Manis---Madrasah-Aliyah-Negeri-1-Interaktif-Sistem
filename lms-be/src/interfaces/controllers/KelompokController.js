export class KelompokController {
constructor(kelompokUseCase) {
    this.kelompokUseCase = kelompokUseCase;
}

async getKelompok(req, res) {
    try {
        const { idMataKuliah } = req.params;
        const data = await this.kelompokUseCase.getDaftarKelompok(idMataKuliah);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async getAllKelompok(req, res) {
    try {
        const nipGuru = req.user?.guru?.nip;
        const idKelas = req.query.idKelas ? parseInt(req.query.idKelas) : null;
        const data = await this.kelompokUseCase.getAllKelompok(nipGuru, idKelas);
        res.status(200).json({ status: 'success', data });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

async createKelompok(req, res) {
    try {
        const result = await this.kelompokUseCase.createNewGroup(req.body);
        res.status(201).json({ message: "Kelompok berhasil dibuat", data: result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async addMember(req, res) {
    try {
        const { idKelompok } = req.params;
        const { nis } = req.body;
        await this.kelompokUseCase.addMember(idKelompok, nis);
        res.status(200).json({ status: 'success', message: "Anggota berhasil ditambahkan" });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ status: 'error', message: "Anggota sudah ada di kelompok ini" });
        }
        res.status(400).json({ status: 'error', message: error.message });
    }
}

async removeMember(req, res) {
    try {
        const { idKelompok, nis } = req.params;
        await this.kelompokUseCase.removeMember(idKelompok, nis);
        res.status(200).json({ message: "Anggota dikeluarkan" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async saveGrades(req, res) {
    try {
        const { idKelompok } = req.params;
        const { grades } = req.body;
        await this.kelompokUseCase.saveGrades(idKelompok, grades);
        res.status(200).json({ message: "Nilai berhasil disimpan" });
    } catch (error) {
        res.status(400).json({ error: error.message });
        }
    }

async getSiswa(req, res) {
    try {
        const data = await this.kelompokUseCase.getAllSiswa();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async deleteKelompok(req, res) {
    try {
        const { idKelompok } = req.params;
        await this.kelompokUseCase.deleteKelompok(idKelompok);
        res.status(200).json({ status: 'success', message: "Kelompok berhasil dihapus" });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
}
}