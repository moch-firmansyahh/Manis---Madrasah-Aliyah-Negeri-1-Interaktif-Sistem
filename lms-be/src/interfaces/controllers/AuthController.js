export class AuthController {
  constructor(authUseCase) {
    this.authUseCase = authUseCase;
  }

  async login(req, res) {
    try {
      // 1. Accept multiple identifier types: email, nis, nip, or nomorInduk
      const { email, nis, nip, nomorInduk, password, role } = req.body;

      // 2. Validasi input kosong - support email, nis, nip, atau nomorInduk
      const identifier = email || nis || nip || nomorInduk;
      if (!identifier || !password) {
        return res.status(400).json({
          status: 'error',
          message: 'Email, NIS, NIP, atau Nomor Induk dan Password harus diisi.'
        });
      }

      // 3. Panggil Usecase untuk melakukan proses login sesungguhnya
      const result = await this.authUseCase.login(identifier, password, role);

      // 4. Jika berhasil, kirimkan token JWT dan data user ke frontend
      return res.status(200).json({
        status: 'success',
        message: 'Login berhasil.',
        data: {
          token: result.token,
          user: result.user
        }
      });

    } catch (error) {
      // 4. Jika terjadi error (misal: password salah, user tidak ditemukan, dsb)
      // Tangkap pesan error dari UseCase dan kirim status 401 (Unauthorized)
      return res.status(401).json({
        status: 'error',
        message: error.message
      });
    }
  }
}