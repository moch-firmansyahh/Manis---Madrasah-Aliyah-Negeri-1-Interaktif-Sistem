export class ModulAjar {
constructor({ idModulAjar, idMataKuliah, judul, tipe_modul, deskripsi, url, fileUrl, ukuran, tanggal, diunduh, canDownload }) {
    this.idModulAjar = idModulAjar;
    this.idMataKuliah = idMataKuliah;
    this.judul = judul;
    this.tipe_modul = tipe_modul;
    this.deskripsi = deskripsi;
    this.url = url;
    this.fileUrl = fileUrl;
    this.ukuran = ukuran;
    this.tanggal = tanggal;
    this.diunduh = diunduh;
    this.canDownload = canDownload;
}

isValid() {
    if (!this.judul || this.judul.trim() === "") return false;
    if ((this.tipe_modul === "Link" || this.tipe_modul === "Video") && !this.url) return false;
    return true;
    }
}