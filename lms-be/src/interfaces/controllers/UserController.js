export class UserController {
  constructor(userUseCase) {
    this.userUseCase = userUseCase;
  }

  async createUser(req, res) {
    try {
      const user = await this.userUseCase.registerUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getUsers(req, res) {
    try {
      const users = await this.userUseCase.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Gagal mengambil data user", details: error.message });
    }
  }

  async update(req, res) {
    try {
      const { nomorInduk } = req.params; // Ambil ID dari URL
      const updateData = req.body;      // Ambil data baru dari Body

      const result = await this.userUseCase.updateUser(nomorInduk, updateData);
      
      res.json({
        message: "Data berhasil diperbarui",
        data: result
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateMyProfile(req, res) {
    try {
      const nomorInduk = req.user.nomorInduk; // Ambil dari token JWT
      const { email, telepon } = req.body;

      const result = await this.userUseCase.updateUser(nomorInduk, { email, telepon });
      
      res.json({
        message: "Profil berhasil diperbarui",
        data: result
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { nomorInduk } = req.params;
      await this.userUseCase.deleteUser(nomorInduk);
      
      res.json({
        message: `User dengan ID ${nomorInduk} berhasil dihapus selamanya`
      });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
}