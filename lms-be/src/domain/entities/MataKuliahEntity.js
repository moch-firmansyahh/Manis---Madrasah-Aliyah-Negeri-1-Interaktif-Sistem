export class MataKuliah {
  constructor({ idMataKuliah, namaMataKuliah }) {
    this.idMataKuliah = idMataKuliah;
    this.namaMataKuliah = namaMataKuliah;
  }

  validate() {
    if (!this.namaMataKuliah || this.namaMataKuliah.length < 3) {
      throw new Error("Nama Mata Kuliah minisal 3 karakter");
    }
  }
}