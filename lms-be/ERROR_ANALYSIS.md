# 🚨 Error Analysis & Potential Issues

## Tanggal: 29 April 2026
## Status: Ada 10 Potensi Error Tak Terduga yang Perlu Ditangani

---

## 1. ❌ MISSING NULL CHECKS

### File: `src/usecases/UserUseCase.js` (Line 57)
**Masalah:**
```javascript
async getAllUsersRole() {
  return await this.userRepository.findRoleById; // Return function, bukan result!
}
```
**Dampak:** Return `undefined` → Frontend crash
**Solusi:**
```javascript
async getAllUsersRole() {
  return await this.userRepository.findRoles(); // Panggil method untuk get semua roles
}
```

---

## 2. ❌ UNHANDLED PROMISE REJECTION

### File: `src/interfaces/controllers/UserController.js` (Line 15)
**Masalah:**
```javascript
async getUsers(req, res) {
  const users = await this.userUseCase.getAllUsers(); // ❌ No try-catch!
  res.json(users);
}
```
**Dampak:** Jika database error, server crash
**Solusi:** Tambah try-catch
```javascript
async getUsers(req, res) {
  try {
    const users = await this.userUseCase.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil data user" });
  }
}
```

---

## 3. ❌ INPUT VALIDATION KURANG KETAT

### File: `src/usecases/NilaiUseCase.js` (Line 6)
**Masalah:**
```javascript
async inputNilai(data) {
  if (!data.nomorInduk || !data.idMataKuliah) {
    throw new Error("Nomor Induk dan ID Mata Kuliah wajib diisi");
  }
  // ❌ Tidak validasi range nilai (0-100)
  // ❌ Tidak validasi tipe data (harus number)
}
```
**Dampak:** Nilai negatif atau >100 bisa masuk
**Solusi:**
```javascript
async inputNilai(data) {
  if (!data.nomorInduk || !data.idMataKuliah) {
    throw new Error("Nomor Induk dan ID Mata Kuliah wajib diisi");
  }
  
  const nilaiTugas = parseFloat(data.nilaiTugas || 0);
  const nilaiKuis = parseFloat(data.nilaiKuis || 0);
  
  if (isNaN(nilaiTugas) || isNaN(nilaiKuis)) {
    throw new Error("Nilai harus berupa angka");
  }
  
  if (nilaiTugas < 0 || nilaiTugas > 100 || nilaiKuis < 0 || nilaiKuis > 100) {
    throw new Error("Nilai harus antara 0-100");
  }
}
```

---

## 4. ❌ EMAIL VALIDATION TIDAK PROPER

### File: `src/domain/entities/UserEntity.js` (Line 10)
**Masalah:**
```javascript
validate() {
  if (!this.email.includes('@')) throw new Error("Email tidak valid");
  // Email "@domain.com" atau "user@" akan lolos!
}
```
**Solusi:**
```javascript
validate() {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(this.email)) {
    throw new Error("Format email tidak valid");
  }
}
```

---

## 5. ❌ NaN HANDLING PADA PERHITUNGAN NILAI

### File: `src/usecases/NilaiUseCase.js` (Line 13)
**Masalah:**
```javascript
data.nilaiAkhir = (parseFloat(data.nilaiTugas || 0) + parseFloat(data.nilaiKuis || 0)) / 2;
// Jika input: nilaiTugas: "abc", hasil: NaN
```
**Solusi:**
```javascript
const nilaiTugas = parseFloat(data.nilaiTugas || 0);
const nilaiKuis = parseFloat(data.nilaiKuis || 0);

if (isNaN(nilaiTugas) || isNaN(nilaiKuis)) {
  throw new Error("Nilai harus berupa angka yang valid");
}

data.nilaiAkhir = (nilaiTugas + nilaiKuis) / 2;
```

---

## 6. ❌ TRANSACTION ROLLBACK TIDAK CLEAR

### File: `src/infrastucture/repositories/PrismaUserRepository.js` (Line 20)
**Masalah:**
```javascript
async createWithProfile(userData, profileData, roleType) {
  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data: userData });
    
    if (roleType === 'MAHASISWA') {
      // ❌ Jika error di sini, transaction rollback tapi error tidak clear
      await tx.mahasiswa.create({ data: profileData });
    }
  });
}
```
**Solusi:**
```javascript
async createWithProfile(userData, profileData, roleType) {
  try {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ data: userData });
      
      if (roleType === 'MAHASISWA') {
        await tx.mahasiswa.create({ data: profileData });
      }
      
      return user;
    });
  } catch (error) {
    if (error.code === 'P2002') {
      throw new Error("Email atau NIM sudah terdaftar");
    }
    throw error;
  }
}
```

---

## 7. ❌ MULTER UPLOAD TIDAK SECURE

### File: `src/interfaces/routes/modulAjarRoutes.js` (Line 8)
**Masalah:**
```javascript
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage }); // ❌ No size limit, no type check
```
**Solusi:**
```javascript
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/pdf', 'application/msword', 'image/jpeg', 'image/png'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  }
});
```

---

## 8. ❌ PRESENSI QR AMBIL DATA SALAH

### File: `src/infrastucture/repositories/PrismaPresensiRepository.js` (Line 70)
**Masalah:**
```javascript
const presensiSesiIni = await prisma.presensi.findFirst({
  where: {
    nim: nim,
    idMataKuliah: idMataKuliah,
  },
  orderBy: { tanggalPertemuan: 'desc' } // ❌ Ambil terakhir, bukan hari ini!
});
```
**Solusi:**
```javascript
const today = new Date();
today.setHours(0, 0, 0, 0);

const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const presensiSesiIni = await prisma.presensi.findFirst({
  where: {
    nim: nim,
    idMataKuliah: idMataKuliah,
    tanggalPertemuan: {
      gte: today,
      lt: tomorrow
    }
  }
});
```

---

## 9. ❌ JWT SECRET HARDCODED FALLBACK

### File: `src/interfaces/middlewares/authMiddleware.js` (Line 13)
**Masalah:**
```javascript
const secret = process.env.JWT_SECRET || 'rahasia_super_aman'; // ❌ Fallback tidak aman
```
**Solusi:**
```javascript
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable not set!");
}
const secret = process.env.JWT_SECRET;
```

---

## 10. ❌ FOREIGN KEY ERROR TIDAK CLEAR

### File: `src/usecases/UserUseCase.js` (Line 33)
**Masalah:**
```javascript
const role = await this.userRepository.findRoleById(data.roleId);
if (!role) throw new Error("Role tidak ditemukan");
// ❌ Tapi create bisa tetap gagal karena foreign key constraint
```
**Solusi:** Error handling di repository level untuk database errors

---

## 📊 Summary

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| 1 | Missing null checks | 🔴 High | Not Fixed |
| 2 | Unhandled promise rejection | 🔴 High | Not Fixed |
| 3 | Input validation kurang | 🟠 Medium | Not Fixed |
| 4 | Email validation weak | 🟠 Medium | Not Fixed |
| 5 | NaN handling | 🟠 Medium | Not Fixed |
| 6 | Transaction error handling | 🟠 Medium | Not Fixed |
| 7 | Multer security | 🟡 Low | Not Fixed |
| 8 | Presensi QR logic | 🟠 Medium | Not Fixed |
| 9 | JWT secret fallback | 🟠 Medium | Not Fixed |
| 10 | Foreign key errors | 🟠 Medium | Not Fixed |

---

## 🎯 Action Items

- [ ] Tambah comprehensive input validation di semua use cases
- [ ] Add try-catch di semua controller methods
- [ ] Improve email regex validation
- [ ] Secure multer configuration
- [ ] Fix presensi date filtering logic
- [ ] Remove hardcoded JWT secret fallback
- [ ] Add proper error handling untuk database constraints
- [ ] Add unit tests untuk edge cases
- [ ] Implement logging untuk debugging

---

**Generated:** 29 April 2026
**Next Review:** Setelah perbaikan semua issues
