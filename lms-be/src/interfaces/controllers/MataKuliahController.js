import { prisma } from '../../prismaClient.js';

export class MataKuliahController {

  constructor(mataKuliahUseCase) {
    this.mataKuliahUseCase = mataKuliahUseCase;
  }

  async create(req, res) {
    try {
      const result = await this.mataKuliahUseCase.addMataKuliah(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAll(req, res) {
    try {
      if (req.user && req.user.role === 'GURU' && req.user.guru) {
        const idKelas = req.query.idKelas ? parseInt(req.query.idKelas) : null;
        const result = await this.mataKuliahUseCase.getByGuru(req.user.guru.nip, idKelas);
        return res.json(result);
      }
      
      if (req.user && req.user.role === 'SISWA') {
        let nis = req.user?.nomorInduk;
        const siswa = await prisma.siswa.findUnique({
          where: { nomorInduk: nis }
        });
        const actualNis = siswa ? siswa.nis : nis;
        const result = await this.mataKuliahUseCase.getByNis(actualNis);
        return res.json(result);
      }
      
      const result = await this.mataKuliahUseCase.getAll();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getMine(req, res) {
    try {
      let nis = req.user?.nomorInduk;
      // Map nomorInduk to actual nis if possible
      const siswa = await prisma.siswa.findUnique({
        where: { nomorInduk: nis }
      });
      const actualNis = siswa ? siswa.nis : nis;
      
      const result = await this.mataKuliahUseCase.getByNis(actualNis);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getOne(req, res) {
    try {
      const result = await this.mataKuliahUseCase.getById(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const result = await this.mataKuliahUseCase.updateMataKuliah(req.params.id, req.body);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      await this.mataKuliahUseCase.deleteMataKuliah(req.params.id);
      res.json({ message: "Mata Kuliah berhasil dihapus" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getDetail(req, res) {
    try {
      const { idMataKuliah } = req.params;
      const data = await this.mataKuliahUseCase.getDetailMataKuliah(parseInt(idMataKuliah));
      
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      res.status(404).json({ status: 'error', message: error.message });
    }
  }
}