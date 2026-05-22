import { prisma } from '../../prismaClient.js';

export class PresensiController {
  constructor(presensiUseCase) {
    this.presensiUseCase = presensiUseCase;
  }

  async getDaftarHadir(req, res) {
    try {
      const { idMataKuliah } = req.params;
      const data = await this.presensiUseCase.getDaftarHadir(parseInt(idMataKuliah));
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async scanQR(req, res) {
    try {
      let nis = req.user?.nomorInduk;
      
      // Jika nomorInduk tidak cocok dengan NIS di tabel Presensi, cari NIS dari tabel Siswa
      const siswa = await prisma.siswa.findUnique({
        where: { nomorInduk: nis }
      });
      if (siswa) {
        nis = siswa.nis; // Gunakan nis yang sesuai untuk presensi
      }
      
      const { idMataKuliah, token } = req.body;
      const result = await this.presensiUseCase.scanKehadiran(nis, parseInt(idMataKuliah), token);
      
      res.status(200).json({ status: 'success', message: 'Absen Berhasil!', data: result });
    } catch (error) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async getPresensiSiswa(req, res) {
    try {
      let nis = req.user?.nomorInduk || req.query.nis;
      const siswa = await prisma.siswa.findUnique({
        where: { nomorInduk: nis }
      });
      if (siswa) {
        nis = siswa.nis;
      }
      const { idMataKuliah } = req.params;
      const data = await this.presensiUseCase.getRiwayatKehadiran(nis, parseInt(idMataKuliah));
      res.status(200).json(data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getSummaryPresensi(req, res) {
    try {
      let nis = req.user?.nomorInduk || req.query.nis;
      const siswa = await prisma.siswa.findUnique({
        where: { nomorInduk: nis }
      });
      if (siswa) {
        nis = siswa.nis;
      }
      const { idMataKuliah } = req.params;
      const data = await this.presensiUseCase.getSummaryKehadiran(nis, parseInt(idMataKuliah));
      res.status(200).json(data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}