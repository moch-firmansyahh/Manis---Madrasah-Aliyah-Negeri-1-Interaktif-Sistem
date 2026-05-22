import { prisma } from '../../../lib/prisma.ts';

export class TugasController {
  constructor(tugasUseCase) {
    this.tugasUseCase = tugasUseCase;
  }

  async getAll(req, res) {
    try {
      const { idMataKuliah } = req.query;
      
      // Get nis from user
      let nis = req.user?.siswa?.nis;
      const nomorInduk = req.user?.nomorInduk;
      
      if (!nis && nomorInduk) {
        const mhs = await prisma.siswa.findUnique({ where: { nomorInduk } });
        if (mhs) nis = mhs.nis;
      }
      
      if (!nis) {
        return res.status(400).json({ error: "NIS tidak ditemukan" });
      }
      
      // Get courses taken by siswa (same as dashboard)
      const mataKuliahList = await prisma.mataKuliah.findMany({
        where: {
          OR: [
            { nilai: { some: { nomorInduk: nomorInduk } } },
            { presensi: { some: { nis: nis } } },
            { tugas: { some: { nis: nis } } },
            { kelompok: { some: { anggota: { some: { nis: nis } } } } },
          ],
        },
        select: { idMataKuliah: true }
      });
      
      const idMkList = mataKuliahList.map(mk => mk.idMataKuliah);
      
      const filter = {};
      if (idMataKuliah) {
        filter.idMataKuliah = idMataKuliah;
      } else if (idMkList.length > 0) {
        filter.idMataKuliah = { in: idMkList };
      }
      filter.nis = nis; // Hanya untuk cek status pengumpulan, bukan filter row
      
      const data = await this.tugasUseCase.getDaftarTugas(filter);
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getDetail(req, res) {
    try {
      const { id } = req.params;
      const nis = req.user?.siswa?.nis || req.query.nis;
      if (!nis) return res.status(400).json({ error: "NIS diperlukan" });
      const data = await this.tugasUseCase.getDetailTugas(id, nis);
      res.status(200).json(data);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async submit(req, res) {
    try {
      const idTugas = req.params.idTugas || req.body.idTugas;
      const nis = req.user?.siswa?.nis || req.body.nis;
      const { judul, detailTugas, fileJawaban } = req.body;
      
      if (!idTugas || !nis) {
        return res.status(400).json({ error: "idTugas dan nis wajib diisi" });
      }
      const uploadedFilePath = req.file
        ? `/uploads/${req.file.filename}`
        : fileJawaban || "";
      const result = await this.tugasUseCase.kumpulTugas({
        idTugas: parseInt(idTugas),
        nis,
        judul,
        detailTugas,
        fileJawaban: uploadedFilePath,
      });
      res
        .status(201)
        .json({ message: "Tugas berhasil dikumpulkan", data: result });
    } catch (error) {
      console.error("SUBMIT ERROR:", error);
      res.status(400).json({ error: error.message });
    }
  }

  async getSubmission(req, res) {
    try {
      const { idTugas } = req.params;
      const nis = req.query.nis;
      if (!nis) {
        return res
          .status(400)
          .json({ error: "NIS diperlukan sebagai query parameter" });
      }
      const data = await this.tugasUseCase.tugasRepository.getSubmission(
        idTugas,
        nis,
      );
      res.status(200).json(data || {});
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async deleteSubmission(req, res) {
    try {
      const { idPengumpulan } = req.params;
      await this.tugasUseCase.tugasRepository.deleteSubmission(idPengumpulan);
      res.status(200).json({ message: "Pengumpulan berhasil dibatalkan" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}
