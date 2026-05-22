export class PresensiGuruController {
constructor(presensiUseCase) {
    this.presensiUseCase = presensiUseCase;
}

async getDaftarHadir(req, res) {
    try {
        const { idMataKuliah } = req.params;
        const data = await this.presensiUseCase.getDaftarHadir(idMataKuliah);
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
}

async updateStatus(req, res) {
    try {
        const { idPresensi } = req.params;
        const { status } = req.body;
        const updatedData = await this.presensiUseCase.ubahStatusSiswa(idPresensi, status);
        res.status(200).json({ success: true, message: "Status diperbarui", data: updatedData });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
}

async updateStatusByNis(req, res) {
    try {
        const { nis, idMataKuliah } = req.params;
        const { status } = req.body;
        const updatedData = await this.presensiUseCase.ubahStatusByNis(nis, parseInt(idMataKuliah), status);
        res.status(200).json({ success: true, message: "Status diperbarui", data: updatedData });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
}
}