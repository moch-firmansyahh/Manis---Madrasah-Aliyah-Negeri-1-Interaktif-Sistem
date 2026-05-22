export class IdGenerator {
  // Menghasilkan format U001, D001, P001
  static generateNomorInduk(prefix, lastNumber = 0) {
    const nextNumber = lastNumber + 1;
    // padStart(3, '0') akan mengubah 1 menjadi 001
    return `${prefix}${String(nextNumber).padStart(3, '0')}`;
  }

  // Menghasilkan format 2021001
  static generateNIS(tahun, lastNumber = 0) {
    const nextNumber = lastNumber + 1;
    return `${tahun}${String(nextNumber).padStart(3, '0')}`;
  }
}