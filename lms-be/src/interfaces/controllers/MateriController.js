export class MateriController {
  constructor(materiUseCase) {
    this.materiUseCase = materiUseCase;
  }

  async getMateriWithProgress(req, res) {
    try {
      const { idMataKuliah } = req.params;
      const nis = req.user?.siswa?.nis || req.query.nis;

      if (!nis) {
        return res.status(400).json({ error: 'NIS diperlukan' });
      }

      const data = await this.materiUseCase.getMateriWithProgress(
        parseInt(idMataKuliah),
        nis
      );

      res.status(200).json(data);
    } catch (error) {
      console.error('getMateriWithProgress error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async markAsAccessed(req, res) {
    try {
      const { idModulAjar } = req.params;
      const nis = req.user?.siswa?.nis || req.body.nis;

      if (!nis) {
        return res.status(400).json({ error: 'NIS diperlukan' });
      }

      const result = await this.materiUseCase.markAsAccessed(
        parseInt(idModulAjar),
        nis
      );

      res.status(200).json({
        message: 'Materi ditandai sudah diakses',
        data: result,
      });
    } catch (error) {
      console.error('markAsAccessed error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getProgressSummary(req, res) {
    try {
      const { idMataKuliah } = req.params;
      const nis = req.user?.siswa?.nis || req.query.nis;

      if (!nis) {
        return res.status(400).json({ error: 'NIS diperlukan' });
      }

      const data = await this.materiUseCase.getProgressSummary(
        parseInt(idMataKuliah),
        nis
      );

      res.status(200).json(data);
    } catch (error) {
      console.error('getProgressSummary error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}
