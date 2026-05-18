export class NilaiController {

  constructor(nilaiUseCase, transkripUseCase) {
    this.nilaiUseCase = nilaiUseCase;
    this.transkripUseCase = transkripUseCase;
  }

  async create(req, res) {
    try {
      const result = await this.nilaiUseCase.inputNilai(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getByMahasiswa(req, res) {
    try {
      const nim = req.user?.nomorInduk || req.query.nim;
      const { idMataKuliah } = req.params;
      const result = await this.nilaiUseCase.getNilaiMahasiswa(nim, idMataKuliah);
      res.json(result);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const result = await this.nilaiUseCase.getAllNilai();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getByMataKuliah(req, res) {
    try {
      const { idMataKuliah } = req.params;
      const result = await this.nilaiUseCase.getNilaiByMataKuliah(idMataKuliah);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const result = await this.nilaiUseCase.updateNilai(id, req.body);
      
      res.json({
        message: "Nilai berhasil diperbarui dan dikalkulasi ulang",
        data: result
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  
  async getTranskrip(req, res) {
    try {
      const nomorInduk = req.user.nomorInduk; 
      const transkrip = await this.transkripUseCase.execute(nomorInduk);
      res.status(200).json({ status: 'success', data: transkrip });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getPengumpulanIndividu(req, res) {
    try {
      const { idMataKuliah } = req.params;
      const result = await this.nilaiUseCase.getPengumpulanIndividu(idMataKuliah);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getTugasByMataKuliah(req, res) {
    try {
      const { idMataKuliah } = req.params;
      const result = await this.nilaiUseCase.getTugasByMataKuliah(idMataKuliah);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getPengumpulanPerTugas(req, res) {
    try {
      const { idTugas } = req.params;
      const { idMataKuliah, tipe } = req.query;
      if (!idMataKuliah) return res.status(400).json({ error: 'idMataKuliah diperlukan' });
      const result = await this.nilaiUseCase.getPengumpulanPerTugas(idTugas, idMataKuliah, tipe);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async saveNilaiTugas(req, res) {
    try {
      const result = await this.nilaiUseCase.saveNilaiTugas(req.body);
      res.status(200).json({ status: 'success', message: "Nilai berhasil disimpan", data: result });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}