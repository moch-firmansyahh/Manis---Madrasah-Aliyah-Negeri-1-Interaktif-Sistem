export class TugasGuruController {
constructor(tugasGuruUseCase) {
    this.tugasGuruUseCase = tugasGuruUseCase;
}

async getAllTugas(req, res) {
    try {
        let matkulIds = [];
        if (req.query.idMataKuliah) {
            matkulIds = [parseInt(req.query.idMataKuliah)];
        } else if (req.user && req.user.role === 'GURU' && req.user.guru) {
             const matkuls = await this.tugasGuruUseCase.mataKuliahRepository.findByGuru(req.user.guru.nip);
             matkulIds = matkuls.map(m => m.idMataKuliah);
        }
        const tasks = await this.tugasGuruUseCase.getDaftarTugas(matkulIds);
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async create(req, res) {
    try {
      // payload dari frontend form + file info if uploaded
      const payload = { ...req.body };

      // Add file info if file was uploaded
      if (req.file) {
        payload.fileTugas = `/uploads/${req.file.filename}`;
        // Trim nama file jika terlalu panjang (max 255 chars)
        const originalName = req.file.originalname;
        payload.namaFileTugas = originalName.length > 250
          ? originalName.substring(0, 247) + '...'
          : originalName;
        payload.tipeFileTugas = req.file.mimetype;
        payload.ukuranFile = `${(req.file.size / 1024).toFixed(2)} KB`;
      }

      const newTask = await this.tugasGuruUseCase.createTugasAtauKuis(payload);
      res.status(201).json({ message: "Tugas berhasil dibuat", data: newTask });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async update(req, res) {
    try {
        const { id } = req.params;
        const payload = { ...req.body };

        // Add file info if file was uploaded
        if (req.file) {
          payload.fileTugas = `/uploads/${req.file.filename}`;
          // Trim nama file jika terlalu panjang (max 255 chars)
          const originalName = req.file.originalname;
          payload.namaFileTugas = originalName.length > 250
            ? originalName.substring(0, 247) + '...'
            : originalName;
          payload.tipeFileTugas = req.file.mimetype;
          payload.ukuranFile = `${(req.file.size / 1024).toFixed(2)} KB`;
        }

        const updated = await this.tugasGuruUseCase.updateTugas(id, payload);
        res.status(200).json({ message: "Tugas berhasil diperbarui", data: updated });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async destroy(req, res) {
    try {
        const { id } = req.params;
        await this.tugasGuruUseCase.deleteTugas(id);
        res.status(200).json({ message: "Tugas berhasil dihapus" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async submitGrades(req, res) {
    try {
        await this.tugasGuruUseCase.gradeTugas(req.body);
        res.status(200).json({ message: "Nilai berhasil disimpan" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
    }
}