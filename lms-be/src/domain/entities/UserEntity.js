export class User {
  constructor({ nomorInduk, nama, email, password }) {
    this.nomorInduk = nomorInduk;
    this.nama = nama;
    this.email = email;
    this.password = password;
  }

  // Kamu bisa tambah logika validasi di sini
  validate() {
    // Email validation: must be a valid email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      throw new Error("Format email tidak valid (harus: user@domain.com)");
    }
  }
}