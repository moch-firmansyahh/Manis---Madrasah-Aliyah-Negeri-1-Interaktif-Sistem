export class ModulAjarController {
constructor(modulAjarUseCase) {
    this.useCase = modulAjarUseCase;
}

async getAll(req, res) {
    try {
        const { matkul, tipe } = req.query;
        const nipGuru = req.user?.role === 'GURU' ? req.user?.guru?.nip : null;
        const data = await this.useCase.getMateri(matkul, tipe, nipGuru);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async create(req, res) {
    try {
      // Data teks dari body, file dari multer
        const data = { ...req.body };
        const file = req.file; 
        const result = await this.useCase.createMateri(data, file);
        res.status(201).json({ message: "Materi berhasil ditambahkan", data: result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async update(req, res) {
    try {
        const { id } = req.params;
        const data = req.body;
        const result = await this.useCase.updateMateri(id, data);
        res.status(200).json({ message: "Materi berhasil diperbarui", data: result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async remove(req, res) {
    try {
        const { id } = req.params;
        await this.useCase.deleteMateri(id);
        res.status(200).json({ message: "Materi berhasil dihapus" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async download(req, res) {
    try {
        const { id } = req.params;
        const result = await this.useCase.downloadMateri(id);
        res.status(200).json({ message: "Berhasil mengunduh", data: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    }
}