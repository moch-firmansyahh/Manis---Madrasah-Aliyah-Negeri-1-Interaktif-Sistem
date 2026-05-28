import { prisma } from "../src/prismaClient.js";
import bcrypt from "bcrypt";

async function main() {
  console.log("Memulai proses seeding data...");
  console.log("Menghapus data lama...");

  const tables = [
    'likeForum', 'komentarForum', 'forumDiskusi', 'pilihanJawaban', 'soal', 'kuis',
    'pengumpulanTugas', 'progressTugas', 'anggotaKelompok', 'kelompok',
    'notifikasi', 'presensi', 'tugas', 'nilai', 'modulAjar', 'mataKuliah',
    'progressMateri', 'siswa', 'guru', 'user', 'role', 'kelas', 'jurusan',
    'jawabanKuis',
  ];
  for (const t of tables) {
    try { await prisma[t].deleteMany(); } catch (_) {}
  }

  console.log("Data lama berhasil dihapus.");

  // ══════════════════════════════════════════════
  // 1. ROLES
  // ══════════════════════════════════════════════
  const roles = [
    { id: 1, nama: "ADMIN" },
    { id: 2, nama: "SISWA" },
    { id: 3, nama: "GURU" },
  ];
  for (const role of roles) {
    await prisma.role.create({ data: role });
  }
  console.log("3 Role berhasil dibuat.");

  const hashedPassword = await bcrypt.hash("password123", 10);

  // ══════════════════════════════════════════════
  // 2. JURUSAN & KELAS
  // ══════════════════════════════════════════════
  const jurusanList = [
    { idJurusan: 1, namaJurusan: "MIPA" },
    { idJurusan: 2, namaJurusan: "IPS" },
  ];
  for (const j of jurusanList) {
    await prisma.jurusan.create({ data: j });
  }
  console.log("2 Jurusan berhasil dibuat.");

  const kelasData = [
    { namaKelas: "X MIPA 1", tingkat: 10, idJurusan: 1 },
    { namaKelas: "X MIPA 2", tingkat: 10, idJurusan: 1 },
    { namaKelas: "XI MIPA 1", tingkat: 11, idJurusan: 1 },
    { namaKelas: "XI MIPA 2", tingkat: 11, idJurusan: 1 },
    { namaKelas: "XII MIPA 1", tingkat: 12, idJurusan: 1 },
    { namaKelas: "XII MIPA 2", tingkat: 12, idJurusan: 1 },
    { namaKelas: "X IPS 1", tingkat: 10, idJurusan: 2 },
    { namaKelas: "XI IPS 1", tingkat: 11, idJurusan: 2 },
    { namaKelas: "XII IPS 1", tingkat: 12, idJurusan: 2 },
  ];
  const createdKelas = [];
  for (const k of kelasData) {
    const created = await prisma.kelas.create({ data: k });
    createdKelas.push(created);
  }
  console.log(`${createdKelas.length} Kelas berhasil dibuat.`);

  // ══════════════════════════════════════════════
  // 3. GURU (13 Guru)
  // ══════════════════════════════════════════════
  const guruList = [
    {
      ni: "D001",
      nama: "Budi Santoso, S.Pd",
      email: "budi.santoso@sch.id",
      nip: "198001012010011001",
      nidn: "0401018001",
      bidang: "Matematika",
      ruangKantor: "Ruang Guru Lt.1 R.101",
    },
    {
      ni: "D002",
      nama: "Siti Rahayu, M.Pd",
      email: "siti.rahayu@sch.id",
      nip: "197505152005012001",
      nidn: "0515057501",
      bidang: "Fisika",
      ruangKantor: "Ruang Guru Lt.1 R.102",
    },
    {
      ni: "D003",
      nama: "Ahmad Fauzi, S.Si",
      email: "ahmad.fauzi@sch.id",
      nip: "198203102010011002",
      nidn: "1003028201",
      bidang: "Kimia",
      ruangKantor: "Ruang Guru Lt.2 R.205",
    },
    {
      ni: "D004",
      nama: "Dewi Lestari, S.Pd",
      email: "dewi.lestari@sch.id",
      nip: "198506202012012001",
      nidn: "2006058501",
      bidang: "Biologi",
      ruangKantor: "Ruang Guru Lt.2 R.201",
    },
    {
      ni: "D005",
      nama: "Rudi Hermawan, M.Si",
      email: "rudi.hermawan@sch.id",
      nip: "197912252008011001",
      nidn: "2512127901",
      bidang: "Geografi",
      ruangKantor: "Ruang Guru Lt.1 R.103",
    },
    {
      ni: "D006",
      nama: "Momoh Mulyati, S.Pd",
      email: "momoh.mulyati@sch.id",
      nip: "198702122010012002",
      nidn: "0212871201",
      bidang: "Bahasa Inggris",
      ruangKantor: "Ruang Guru Lt.1 R.104",
    },
    {
      ni: "D007",
      nama: "Fitri Nur Cahyati, S.Pd",
      email: "fitri.cahyati@sch.id",
      nip: "199003052013012001",
      nidn: "0503901001",
      bidang: "Bahasa Inggris",
      ruangKantor: "Ruang Guru Lt.1 R.105",
    },
    {
      ni: "D008",
      nama: "Euis Kusmawati, S.Pd",
      email: "euis.kusmawati@sch.id",
      nip: "198508152011012001",
      nidn: "1508852001",
      bidang: "Bahasa Indonesia",
      ruangKantor: "Ruang Guru Lt.2 R.202",
    },
    {
      ni: "D009",
      nama: "Deden Saefuloh, S.Pd., M.Pd",
      email: "deden.saefuloh@sch.id",
      nip: "198107202009011002",
      nidn: "2007811001",
      bidang: "PPKn & Sejarah",
      ruangKantor: "Ruang Guru Lt.2 R.203",
    },
    {
      ni: "D010",
      nama: "H. Usep Fathudin, S.Ag., M.Ag",
      email: "usep.fathudin@sch.id",
      nip: "197810102008011003",
      nidn: "1010788001",
      bidang: "PAI",
      ruangKantor: "Ruang Guru Lt.1 R.106",
    },
    {
      ni: "D011",
      nama: "Maman Abdurrahman, S.Ag., M.Pd",
      email: "maman.abdurrahman@sch.id",
      nip: "198312112011011001",
      nidn: "1112831101",
      bidang: "Bahasa Arab",
      ruangKantor: "Ruang Guru Lt.2 R.204",
    },
    {
      ni: "D012",
      nama: "Tati Sumiati, S.Pd., M.Hum",
      email: "tati.sumiati@sch.id",
      nip: "199105122014012001",
      nidn: "1205911001",
      bidang: "Bahasa Sunda",
      ruangKantor: "Ruang Guru Lt.1 R.107",
    },
    {
      ni: "D013",
      nama: "Iwan Setiawan, S.E., M.Si",
      email: "iwan.setiawan@sch.id",
      nip: "198011052009011003",
      nidn: "0511801001",
      bidang: "Ekonomi & Akuntansi",
      ruangKantor: "Ruang Guru Lt.2 R.206",
    },
  ];

  for (const g of guruList) {
    await prisma.user.create({
      data: {
        nomorInduk: g.ni,
        nama: g.nama,
        email: g.email,
        password: hashedPassword,
        telepon: `0812${g.ni.slice(-3)}00001`,
        roleId: 3,
        guru: {
          create: {
            nip: g.nip,
            nidn: g.nidn,
            bidang: g.bidang,
            ruangKantor: g.ruangKantor,
          },
        },
      },
    });
  }
  console.log(`${guruList.length} Guru berhasil dibuat.`);

  // ══════════════════════════════════════════════
  // 3. SISWA (90 Siswa — 10 per kelas)
  // ══════════════════════════════════════════════
  const namaDepan = ["Andi", "Bella", "Cahya", "Dina", "Eko", "Fitri", "Galih", "Hana", "Irfan", "Jasmine", "Rizky", "Siti", "Taufik", "Nina", "Rudi"];
  const namaBelakang = ["Pratama", "Safitri", "Nugraha", "Maharani", "Saputra", "Handayani", "Wicaksono", "Permata", "Maulana", "Putri", "Ramadhan", "Kusuma", "Hidayat", "Anggraini", "Purnama"];

  // Generate unique name combos per class using different offsets
  const prefixNis = [202701, 202702, 202703, 202704, 202705, 202706, 202707, 202708, 202709];

  const siswaList = [];
  for (let ki = 0; ki < createdKelas.length; ki++) {
    const kelas = createdKelas[ki];
    for (let si = 0; si < 10; si++) {
      const nis = `${prefixNis[ki]}${String(si + 1).padStart(2, "0")}`;
      const fi = (si + ki * 2) % namaDepan.length;
      const bi = (si + ki * 3 + 2) % namaBelakang.length;
      siswaList.push({
        ni: nis,
        nis: nis,
        nama: `${namaDepan[fi]} ${namaBelakang[bi]} (${kelas.namaKelas})`,
        email: `siswa.${kelas.namaKelas.toLowerCase().replace(/\s+/g, "")}.${si + 1}@sch.id`,
        idKelas: kelas.idKelas,
      });
    }
  }

  for (const s of siswaList) {
    await prisma.user.create({
      data: {
        nomorInduk: s.ni,
        nama: s.nama,
        email: s.email,
        password: hashedPassword,
        telepon: `08123${s.ni}`,
        roleId: 2,
        siswa: { create: { nis: s.nis, idKelas: s.idKelas } },
      },
    });
  }
  console.log(`${siswaList.length} Siswa berhasil dibuat.`);

  // ══════════════════════════════════════════════
  // 4. MATA PELAJARAN (108 — per kelas: 12 MIPA / 12 IPS)
  // ══════════════════════════════════════════════
  const smtCycle = [1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4];

  const mipaMatkulTemplates = [
    { nama: "Matematika",         nipGuru: guruList[0].nip, semester: smtCycle[0],  sks: 3 },
    { nama: "Fisika",             nipGuru: guruList[1].nip, semester: smtCycle[1],  sks: 3 },
    { nama: "Kimia",              nipGuru: guruList[2].nip, semester: smtCycle[2],  sks: 3 },
    { nama: "Biologi",            nipGuru: guruList[3].nip, semester: smtCycle[3],  sks: 3 },
    { nama: "Teknologi/Informatika", nipGuru: guruList[1].nip,  semester: smtCycle[4],  sks: 2 },
    { nama: "Bahasa Indonesia",   nipGuru: guruList[7].nip, semester: smtCycle[5],  sks: 3 },
    { nama: "Bahasa Inggris",     nipGuru: guruList[5].nip, semester: smtCycle[6],  sks: 3 },
    { nama: "PPKn",               nipGuru: guruList[8].nip, semester: smtCycle[7],  sks: 2 },
    { nama: "Sejarah Indonesia",  nipGuru: guruList[8].nip, semester: smtCycle[8],  sks: 2 },
    { nama: "PAI",                nipGuru: guruList[9].nip, semester: smtCycle[9],  sks: 3 },
    { nama: "Bahasa Arab",        nipGuru: guruList[10].nip, semester: smtCycle[10], sks: 2 },
    { nama: "Bahasa Sunda",       nipGuru: guruList[11].nip, semester: smtCycle[11], sks: 2 },
  ];
  const ipsMatkulTemplates = [
    { nama: "Geografi",           nipGuru: guruList[4].nip,  semester: smtCycle[0],  sks: 3 },
    { nama: "Sosiologi",          nipGuru: guruList[4].nip,  semester: smtCycle[1],  sks: 3 },
    { nama: "Ekonomi",            nipGuru: guruList[12].nip, semester: smtCycle[2],  sks: 3 },
    { nama: "Akuntansi",          nipGuru: guruList[12].nip, semester: smtCycle[3],  sks: 3 },
    { nama: "Sejarah Peminatan",  nipGuru: guruList[8].nip,  semester: smtCycle[4],  sks: 2 },
    { nama: "Bahasa Indonesia",   nipGuru: guruList[7].nip,  semester: smtCycle[5],  sks: 3 },
    { nama: "Bahasa Inggris",     nipGuru: guruList[6].nip,  semester: smtCycle[6],  sks: 3 },
    { nama: "PPKn",               nipGuru: guruList[8].nip,  semester: smtCycle[7],  sks: 2 },
    { nama: "Sejarah Indonesia",  nipGuru: guruList[8].nip,  semester: smtCycle[8],  sks: 2 },
    { nama: "PAI",                nipGuru: guruList[9].nip,  semester: smtCycle[9],  sks: 3 },
    { nama: "Bahasa Arab",        nipGuru: guruList[10].nip, semester: smtCycle[10], sks: 2 },
    { nama: "Bahasa Sunda",       nipGuru: guruList[11].nip, semester: smtCycle[11], sks: 2 },
  ];

  const jadwalArr = [
    "Senin,Rabu", "Selasa,Kamis", "Rabu,Jumat", "Senin,Kamis",
    "Selasa,Jumat", "Senin,Rabu", "Selasa,Kamis", "Rabu,Jumat",
    "Senin,Kamis", "Selasa,Jumat", "Rabu,Kamis", "Senin,Jumat",
  ];
  const waktuArr = [
    "07:00 - 08:30", "07:00 - 08:30", "08:30 - 10:00", "08:30 - 10:00",
    "10:00 - 11:30", "10:00 - 11:30", "11:30 - 13:00", "11:30 - 13:00",
    "13:00 - 14:30", "13:00 - 14:30", "14:30 - 16:00", "14:30 - 16:00",
  ];

  const matkulList = [];
  const createdMatkul = [];
  for (let ki = 0; ki < createdKelas.length; ki++) {
    const kelas = createdKelas[ki];
    const templates = kelas.idJurusan === 1 ? mipaMatkulTemplates : ipsMatkulTemplates;
    for (let ti = 0; ti < templates.length; ti++) {
      const tmpl = templates[ti];
      const fullName = `${tmpl.nama} ${kelas.namaKelas}`;
      matkulList.push({
        nama: fullName,
        namaBase: tmpl.nama,
        nipGuru: tmpl.nipGuru,
        idKelas: kelas.idKelas,
        jadwal: jadwalArr[ti],
        waktu: waktuArr[ti],
        semester: tmpl.semester,
        sks: tmpl.sks,
      });
      const created = await prisma.mataKuliah.create({
        data: {
          namaMataKuliah: fullName,
          nipGuru: tmpl.nipGuru,
          idKelas: kelas.idKelas,
          jadwal: jadwalArr[ti],
          waktu: waktuArr[ti],
          semester: tmpl.semester,
          sks: tmpl.sks,
        },
      });
      createdMatkul.push(created);
    }
  }
  console.log(`${matkulList.length} Mata Pelajaran berhasil dibuat.`);

  // ══════════════════════════════════════════════
  // 5. PRESENSI
  // ══════════════════════════════════════════════
  const today = new Date();
  today.setUTCHours(12, 0, 0, 0);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const statusOptions = [
    "Hadir", "Hadir", "Hadir", "Hadir", "Hadir",
    "Hadir", "Hadir", "Sakit", "Izin", "Alpha",
  ];

  const presensiData = [];
  for (const mk of createdMatkul) {
    for (const s of siswaList) {
      if (s.idKelas !== mk.idKelas) continue;
      presensiData.push({
        nis: s.ni,
        idMataKuliah: mk.idMataKuliah,
        tanggalPertemuan: lastWeek,
        waktuPresensi: new Date(
          lastWeek.getTime() + (8 + Math.floor(Math.random() * 4)) * 3600000,
        ),
        statusKehadiran:
          statusOptions[Math.floor(Math.random() * statusOptions.length)],
      });
      presensiData.push({
        nis: s.ni,
        idMataKuliah: mk.idMataKuliah,
        tanggalPertemuan: today,
        statusKehadiran: "Alpha",
      });
    }
  }
  await prisma.presensi.createMany({ data: presensiData });
  console.log(`${presensiData.length} data Presensi berhasil dibuat.`);

  // ══════════════════════════════════════════════
  // 6. NILAI
  // ══════════════════════════════════════════════
  const nilaiData = [];
  for (const mk of createdMatkul) {
    for (const s of siswaList) {
      if (s.idKelas !== mk.idKelas) continue;
      const base = 65 + Math.floor(Math.random() * 30);
      const isComplete = mk.semester <= 3;
      nilaiData.push({
        nomorInduk: s.ni,
        idMataKuliah: mk.idMataKuliah,
        nilaiTugas: Math.min(100, base + Math.floor(Math.random() * 10)),
        nilaiKuis: Math.min(100, base + Math.floor(Math.random() * 8)),
        nilaiAkhir: isComplete ? base : null,
        semester: mk.semester,
      });
    }
  }
  await prisma.nilai.createMany({ data: nilaiData });
  console.log(`${nilaiData.length} data Nilai berhasil dibuat.`);

  // ══════════════════════════════════════════════
  // 7. MODUL AJAR (berdasarkan kurikulum)
  // ══════════════════════════════════════════════
  const modulTopics = {
    "Matematika": [
      { judul: "Limit Fungsi Aljabar", tipe_modul: "PDF", deskripsi: "Materi lengkap tentang limit fungsi aljabar, sifat-sifat limit, dan contoh soal terapan.", ukuran: "2.5 MB", canDownload: true },
      { judul: "Turunan Fungsi", tipe_modul: "Video", deskripsi: "Video pembelajaran turunan fungsi aljabar menggunakan aturan rantai dan turunan dasar.", ukuran: "150 MB", canDownload: false },
      { judul: "Integral Tak Tentu & Tentu", tipe_modul: "PDF", deskripsi: "Pembahasan integral tak tentu dan integral tentu serta teknik integrasi substitusi.", ukuran: "3.1 MB", canDownload: true },
      { judul: "Trigonometri Lanjutan", tipe_modul: "Video", deskripsi: "Video rumus-rumus trigonometri lanjutan, identitas, dan persamaan trigonometri.", ukuran: "180 MB", canDownload: false },
    ],
    "Fisika": [
      { judul: "Gerak Lurus & Melingkar", tipe_modul: "PDF", deskripsi: "Konsep gerak lurus beraturan, GLBB, dan gerak melingkar beraturan.", ukuran: "2.8 MB", canDownload: true },
      { judul: "Dinamika Newton", tipe_modul: "Video", deskripsi: "Video penjelasan Hukum I, II, III Newton beserta contoh soal aplikasi.", ukuran: "160 MB", canDownload: false },
      { judul: "Usaha & Energi", tipe_modul: "PDF", deskripsi: "Konsep usaha, energi kinetik, energi potensial, dan hukum kekekalan energi mekanik.", ukuran: "2.2 MB", canDownload: true },
      { judul: "Gelombang Mekanik", tipe_modul: "Video", deskripsi: "Video sifat-sifat gelombang, gelombang berjalan, dan gelombang stasioner.", ukuran: "140 MB", canDownload: false },
    ],
    "Kimia": [
      { judul: "Stoikiometri & Konsep Mol", tipe_modul: "PDF", deskripsi: "Perhitungan kimia: mol, massa molar, volume molar, dan kadar zat.", ukuran: "3.0 MB", canDownload: true },
      { judul: "Ikatan Kimia", tipe_modul: "Video", deskripsi: "Video jenis-jenis ikatan kimia: ionik, kovalen, logam, dan gaya antar molekul.", ukuran: "170 MB", canDownload: false },
      { judul: "Laju Reaksi", tipe_modul: "PDF", deskripsi: "Faktor-faktor yang mempengaruhi laju reaksi, orde reaksi, dan persamaan laju.", ukuran: "2.6 MB", canDownload: true },
      { judul: "Kesetimbangan Kimia", tipe_modul: "Video", deskripsi: "Video kesetimbangan dinamis, tetapan kesetimbangan, dan azas Le Chatelier.", ukuran: "155 MB", canDownload: false },
    ],
    "Biologi": [
      { judul: "Struktur Sel & Jaringan", tipe_modul: "PDF", deskripsi: "Struktur dan fungsi sel hewan, sel tumbuhan, serta jaringan penyusun organ.", ukuran: "3.5 MB", canDownload: true },
      { judul: "Sistem Organ Manusia", tipe_modul: "Video", deskripsi: "Video sistem pencernaan, peredaran darah, pernapasan, dan ekskresi manusia.", ukuran: "190 MB", canDownload: false },
      { judul: "Genetika & Hereditas", tipe_modul: "PDF", deskripsi: "Hukum Mendel, persilangan monohibrid dan dihibrid, serta penyimpangan semu.", ukuran: "2.9 MB", canDownload: true },
      { judul: "Evolusi & Bioteknologi", tipe_modul: "Video", deskripsi: "Video teori evolusi, bukti-bukti evolusi, dan aplikasi bioteknologi modern.", ukuran: "165 MB", canDownload: false },
    ],
    "Teknologi/Informatika": [
      { judul: "Algoritma & Logika Dasar", tipe_modul: "PDF", deskripsi: "Pengantar algoritma, flowchart, pseudocode, dan logika pemrograman dasar.", ukuran: "2.0 MB", canDownload: true },
      { judul: "Dasar-Dasar Pemrograman", tipe_modul: "Video", deskripsi: "Video tutorial pemrograman dasar menggunakan bahasa Python atau Scratch.", ukuran: "200 MB", canDownload: false },
      { judul: "Jaringan Komputer", tipe_modul: "PDF", deskripsi: "Konsep jaringan komputer, topologi, protokol TCP/IP, dan keamanan jaringan.", ukuran: "2.3 MB", canDownload: true },
    ],
    "Bahasa Indonesia": [
      { judul: "Teks Eksposisi & Argumentasi", tipe_modul: "PDF", deskripsi: "Struktur, ciri kebahasaan, dan langkah menyusun teks eksposisi dan argumentasi.", ukuran: "1.8 MB", canDownload: true },
      { judul: "Menulis Laporan Ilmiah", tipe_modul: "Video", deskripsi: "Video panduan menulis laporan ilmiah sederhana beserta contoh dan template.", ukuran: "120 MB", canDownload: false },
      { judul: "Unsur Sastra Modern", tipe_modul: "PDF", deskripsi: "Analisis unsur intrinsik dan ekstrinsik karya sastra modern Indonesia.", ukuran: "2.1 MB", canDownload: true },
      { judul: "Ejaan & Tata Bahasa Baku", tipe_modul: "Video", deskripsi: "Video pembelajaran EYD, tanda baca, dan penggunaan kata baku dalam tulisan.", ukuran: "110 MB", canDownload: false },
    ],
    "Bahasa Inggris": [
      { judul: "Reading Comprehension", tipe_modul: "PDF", deskripsi: "Strategi membaca teks bahasa Inggris, menemukan ide pokok, dan inference.", ukuran: "2.2 MB", canDownload: true },
      { judul: "Advanced Grammar", tipe_modul: "Video", deskripsi: "Video tenses, modals, passive voice, dan conditional sentences.", ukuran: "130 MB", canDownload: false },
      { judul: "Writing Academic Reports", tipe_modul: "PDF", deskripsi: "Panduan menulis laporan akademik, essay, dan summary dalam bahasa Inggris.", ukuran: "1.9 MB", canDownload: true },
      { judul: "Public Speaking", tipe_modul: "Video", deskripsi: "Video teknik presentasi dan public speaking dalam bahasa Inggris.", ukuran: "145 MB", canDownload: false },
    ],
    "PPKn": [
      { judul: "Nilai-Nilai Pancasila", tipe_modul: "PDF", deskripsi: "Pembahasan nilai-nilai Pancasila sebagai ideologi dan dasar negara.", ukuran: "1.5 MB", canDownload: true },
      { judul: "Sistem Pemerintahan Indonesia", tipe_modul: "Video", deskripsi: "Video struktur pemerintahan Indonesia, lembaga negara, dan pembagian kekuasaan.", ukuran: "100 MB", canDownload: false },
      { judul: "Hak & Kewajiban Warga Negara", tipe_modul: "PDF", deskripsi: "Hak asasi manusia, kewajiban warga negara, dan peraturan perundang-undangan.", ukuran: "1.7 MB", canDownload: true },
    ],
    "Sejarah Indonesia": [
      { judul: "Masa Kolonial & Pergerakan Nasional", tipe_modul: "PDF", deskripsi: "Sejarah kolonialisme Belanda, perlawanan daerah, dan lahirnya pergerakan nasional.", ukuran: "3.2 MB", canDownload: true },
      { judul: "Proklamasi & Kemerdekaan", tipe_modul: "Video", deskripsi: "Video kronologi proklamasi 17 Agustus 1945 dan peristiwa sekitar kemerdekaan.", ukuran: "175 MB", canDownload: false },
      { judul: "Orde Lama, Baru & Reformasi", tipe_modul: "PDF", deskripsi: "Sejarah Indonesia dari Orde Lama, Orde Baru, hingga era Reformasi.", ukuran: "2.8 MB", canDownload: true },
    ],
    "PAI": [
      { judul: "Tafsir Ayat-Ayat Tematik", tipe_modul: "PDF", deskripsi: "Tafsir ayat-ayat Al-Qur'an tentang akhlak, ibadah, dan muamalah.", ukuran: "2.4 MB", canDownload: true },
      { judul: "Fiqih Ibadah & Muamalah", tipe_modul: "Video", deskripsi: "Video tata cara ibadah shalat, zakat, puasa, dan hukum muamalah sehari-hari.", ukuran: "185 MB", canDownload: false },
      { judul: "Peradaban Islam", tipe_modul: "PDF", deskripsi: "Sejarah peradaban Islam dari masa Khulafaur Rasyidin hingga kejayaan Islam.", ukuran: "3.0 MB", canDownload: true },
      { judul: "Akhlak & Tasawuf", tipe_modul: "Video", deskripsi: "Video akhlak terpuji, tasawuf, dan pembersihan jiwa dalam ajaran Islam.", ukuran: "135 MB", canDownload: false },
    ],
    "Bahasa Arab": [
      { judul: "Qawaid: Nahwu & Shorof", tipe_modul: "PDF", deskripsi: "Kaedah nahwu dan shorof dasar untuk memahami struktur kalimat bahasa Arab.", ukuran: "2.7 MB", canDownload: true },
      { judul: "Muthala'ah: Membaca Teks Arab", tipe_modul: "Video", deskripsi: "Video latihan membaca teks bahasa Arab dengan pemahaman dan terjemahan.", ukuran: "125 MB", canDownload: false },
      { judul: "Muhadatsah: Dialog Sehari-hari", tipe_modul: "PDF", deskripsi: "Percakapan bahasa Arab untuk situasi sehari-hari beserta kosakata.", ukuran: "1.6 MB", canDownload: true },
    ],
    "Bahasa Sunda": [
      { judul: "Sastra Sunda & Pupuh", tipe_modul: "PDF", deskripsi: "Karya sastra Sunda, jenis-jenis pupuh, dan contohnya dalam kehidupan.", ukuran: "2.0 MB", canDownload: true },
      { judul: "Aksara Sunda", tipe_modul: "Video", deskripsi: "Video belajar membaca dan menulis aksara Sunda beserta latihan.", ukuran: "115 MB", canDownload: false },
      { judul: "Budaya Lokal Sumedang", tipe_modul: "PDF", deskripsi: "Kearifan lokal Sumedang, tradisi, dan kesenian khas daerah Sumedang.", ukuran: "2.3 MB", canDownload: true },
    ],
    "Geografi": [
      { judul: "Peta & Penginderaan Jauh", tipe_modul: "PDF", deskripsi: "Konsep dasar peta, proyeksi peta, SIG, dan penginderaan jauh.", ukuran: "3.3 MB", canDownload: true },
      { judul: "Litosfer & Atmosfer", tipe_modul: "Video", deskripsi: "Video lapisan bumi, litosfer, atmosfer, cuaca, dan iklim.", ukuran: "160 MB", canDownload: false },
      { judul: "Hidrosfer & Geografi Manusia", tipe_modul: "PDF", deskripsi: "Siklus hidrologi, perairan darat & laut, dan geografi penduduk.", ukuran: "2.5 MB", canDownload: true },
      { judul: "Pembangunan Wilayah", tipe_modul: "Video", deskripsi: "Video konsep pembangunan wilayah, pusat pertumbuhan, dan pemerataan.", ukuran: "140 MB", canDownload: false },
    ],
    "Sosiologi": [
      { judul: "Struktur & Mobilitas Sosial", tipe_modul: "PDF", deskripsi: "Struktur sosial, diferensiasi, stratifikasi, dan mobilitas sosial.", ukuran: "2.1 MB", canDownload: true },
      { judul: "Konflik & Integrasi Sosial", tipe_modul: "Video", deskripsi: "Video teori konflik, integrasi sosial, dan resolusi konflik di masyarakat.", ukuran: "130 MB", canDownload: false },
      { judul: "Lembaga Sosial", tipe_modul: "PDF", deskripsi: "Jenis dan fungsi lembaga sosial: keluarga, pendidikan, ekonomi, agama, politik.", ukuran: "1.9 MB", canDownload: true },
    ],
    "Ekonomi": [
      { judul: "Permintaan & Penawaran", tipe_modul: "PDF", deskripsi: "Hukum permintaan dan penawaran, kurva, dan keseimbangan pasar.", ukuran: "2.4 MB", canDownload: true },
      { judul: "Mekanisme Pasar", tipe_modul: "Video", deskripsi: "Video mekanisme pasar, elastisitas, dan struktur pasar.", ukuran: "150 MB", canDownload: false },
      { judul: "Pendapatan Nasional", tipe_modul: "PDF", deskripsi: "Konsep PDB, PNB, pendapatan per kapita, dan distribusi pendapatan.", ukuran: "2.0 MB", canDownload: true },
    ],
    "Akuntansi": [
      { judul: "Persamaan Dasar Akuntansi", tipe_modul: "PDF", deskripsi: "Konsep persamaan dasar akuntansi, aset, liabilitas, dan ekuitas.", ukuran: "2.2 MB", canDownload: true },
      { judul: "Jurnal Umum & Buku Besar", tipe_modul: "Video", deskripsi: "Video pencatatan transaksi ke jurnal umum dan pemindahbukuan ke buku besar.", ukuran: "145 MB", canDownload: false },
      { judul: "Neraca Saldo & Laporan Keuangan", tipe_modul: "PDF", deskripsi: "Penyusunan neraca saldo, laporan laba rugi, dan laporan perubahan ekuitas.", ukuran: "2.6 MB", canDownload: true },
    ],
    "Sejarah Peminatan": [
      { judul: "Imperialisme & Revolusi Dunia", tipe_modul: "PDF", deskripsi: "Sejarah imperialisme modern, Revolusi Perancis, Revolusi Industri.", ukuran: "3.4 MB", canDownload: true },
      { judul: "Perang Dunia I & II", tipe_modul: "Video", deskripsi: "Video kronologi, penyebab, dan dampak Perang Dunia I dan II.", ukuran: "180 MB", canDownload: false },
      { judul: "Hubungan Internasional", tipe_modul: "PDF", deskripsi: "Organisasi internasional, PBB, dan hubungan diplomatik antar negara.", ukuran: "2.7 MB", canDownload: true },
    ],
  };

  const modulData = [];
  for (let i = 0; i < createdMatkul.length; i++) {
    const mk = createdMatkul[i];
    const baseName = matkulList[i].namaBase;
    const topics = modulTopics[baseName] || modulTopics["Bahasa Indonesia"];
    for (let ti = 0; ti < topics.length; ti++) {
      const t = topics[ti];
      const suffix = `${baseName.replace(/\s+/g, '_').toLowerCase()}_${ti}_${mk.idMataKuliah}`;
      modulData.push({
        idMataKuliah: mk.idMataKuliah,
        judul: t.judul,
        tipe_modul: t.tipe_modul,
        deskripsi: t.deskripsi,
        fileUrl: t.tipe_modul === "PDF" ? `/uploads/modul_${suffix}.pdf` : null,
        url: t.tipe_modul === "Video" ? `https://youtube.com/watch?v=${suffix}` : null,
        ukuran: t.ukuran,
        canDownload: t.canDownload,
      });
    }
  }
  await prisma.modulAjar.createMany({ data: modulData });
  console.log(`${modulData.length} Modul Ajar berhasil dibuat.`);

  // ══════════════════════════════════════════════
  // 8. TUGAS (berdasarkan kurikulum)
  // ══════════════════════════════════════════════
  const tugasMap = {
    "Matematika": [
      { judul: "Problem Set Harian — Limit Fungsi", detail: "Kerjakan 10 soal limit fungsi aljabar menggunakan sifat-sifat limit dan teknik pemfaktoran.", deadlineDays: 7 },
      { judul: "Proyek Statistika Berbasis Data Nyata", detail: "Kumpulkan data nyata di lingkungan sekitar, olah secara statistika, dan buat laporan lengkap.", deadlineDays: 21 },
      { judul: "Ulangan Bab — Turunan & Integral", detail: "Selesaikan 15 soal turunan dan integral fungsi aljabar untuk persiapan ulangan bab.", deadlineDays: 14 },
    ],
    "Fisika": [
      { judul: "Laporan Praktikum Gerak", detail: "Lakukan percobaan gerak menggunakan ticker timer dan buat laporan praktikum lengkap.", deadlineDays: 10 },
      { judul: "Soal Latihan Dinamika Newton", detail: "Kerjakan 10 soal aplikasi Hukum Newton pada bidang miring, katrol, dan gaya gesek.", deadlineDays: 7 },
      { judul: "Proyek Rangkaian Listrik Sederhana", detail: "Buat rangkaian listrik seri-paralel sederhana dan laporkan hasil pengukuran tegangan & arus.", deadlineDays: 24 },
    ],
    "Kimia": [
      { judul: "Tugas Perhitungan Mol", detail: "Selesaikan 10 soal perhitungan mol, massa molar, dan volume gas pada STP.", deadlineDays: 7 },
      { judul: "Laporan Praktikum Laju Reaksi", detail: "Buat laporan praktikum pengaruh suhu dan konsentrasi terhadap laju reaksi kimia.", deadlineDays: 14 },
      { judul: "Makalah Kimia Terapan", detail: "Buat makalah tentang aplikasi elektrokimia dalam kehidupan sehari-hari.", deadlineDays: 28 },
    ],
    "Biologi": [
      { judul: "Laporan Pengamatan Mikroskop", detail: "Amati preparat sel hewan dan tumbuhan di mikroskop, gambar, dan jelaskan strukturnya.", deadlineDays: 10 },
      { judul: "Makalah Genetika", detail: "Buat makalah tentang penerapan hukum Mendel dalam persilangan tanaman.", deadlineDays: 21 },
      { judul: "Proyek Ekologi Lingkungan", detail: "Lakukan observasi ekosistem di sekitar sekolah dan buat laporan rantai makanan.", deadlineDays: 28 },
    ],
    "Teknologi/Informatika": [
      { judul: "Membuat Program Sederhana", detail: "Buat program kalkulator sederhana menggunakan bahasa pemrograman Python.", deadlineDays: 14 },
      { judul: "Praktik Jaringan Komputer", detail: "Lakukan konfigurasi IP address dan uji koneksi antar dua perangkat jaringan.", deadlineDays: 10 },
      { judul: "Laporan Eksplorasi Teknologi", detail: "Buat laporan eksplorasi tentang perkembangan teknologi AI atau IoT terkini.", deadlineDays: 21 },
    ],
    "Bahasa Indonesia": [
      { judul: "Menulis Laporan Ilmiah", detail: "Buat laporan ilmiah sederhana tentang fenomena alam atau sosial dengan struktur yang benar.", deadlineDays: 14 },
      { judul: "Analisis Unsur Sastra", detail: "Analisis unsur intrinsik dan ekstrinsik dari novel atau cerpen yang telah ditentukan.", deadlineDays: 21 },
      { judul: "Presentasi Teks Argumentatif", detail: "Buat teks argumentatif tentang isu terkini dan presentasikan di depan kelas.", deadlineDays: 10 },
    ],
    "Bahasa Inggris": [
      { judul: "Essay Writing", detail: "Write a 500-word essay on the importance of environmental conservation.", deadlineDays: 14 },
      { judul: "Role-Play Conversation", detail: "Practice a role-play conversation about ordering food at a restaurant and record it.", deadlineDays: 10 },
      { judul: "Ringkasan Teks Berbahasa Inggris", detail: "Read an English article and write a summary in your own words.", deadlineDays: 7 },
    ],
    "PPKn": [
      { judul: "Analisis Kasus Kewarganegaraan", detail: "Analisis sebuah kasus pelanggaran hak warga negara dan solusinya.", deadlineDays: 14 },
      { judul: "Makalah Demokrasi", detail: "Buat makalah tentang pelaksanaan demokrasi di Indonesia dari masa ke masa.", deadlineDays: 21 },
      { judul: "Debat Terbimbing", detail: "Buat argumen pro dan kontra untuk topik yang ditentukan dan persiapkan debat.", deadlineDays: 10 },
    ],
    "Sejarah Indonesia": [
      { judul: "Makalah Sejarah", detail: "Buat makalah tentang salah satu peristiwa penting dalam sejarah Indonesia.", deadlineDays: 21 },
      { judul: "Timeline Peristiwa", detail: "Buat timeline peristiwa pergerakan nasional dari tahun 1908 hingga 1945.", deadlineDays: 10 },
      { judul: "Analisis Dokumen Primer", detail: "Analisis isi naskah proklamasi dan kaitannya dengan situasi politik saat itu.", deadlineDays: 14 },
    ],
    "PAI": [
      { judul: "Hafalan Surah Pendek", detail: "Setorkan hafalan surah-surah pendek juz 30 beserta terjemahannya.", deadlineDays: 14 },
      { judul: "Esai Reflektif", detail: "Tulis esai tentang hikmah ibadah shalat dalam kehidupan sehari-hari.", deadlineDays: 21 },
      { judul: "Makalah Fiqih Muamalah", detail: "Buat makalah tentang jual-beli, riba, dan akad syariah dalam ekonomi Islam.", deadlineDays: 28 },
    ],
    "Bahasa Arab": [
      { judul: "Terjemahan Teks Arab", detail: "Terjemahkan teks bahasa Arab tentang kehidupan sehari-hari ke dalam bahasa Indonesia.", deadlineDays: 10 },
      { judul: "Percakapan Lisan", detail: "Buat percakapan lisan bahasa Arab tentang perkenalan dan praktikkan dengan teman.", deadlineDays: 14 },
      { judul: "Menulis Insya'", detail: "Tulis karangan sederhana berbahasa Arab tentang hobi atau cita-cita.", deadlineDays: 21 },
    ],
    "Bahasa Sunda": [
      { judul: "Membuat Pupuh", detail: "Buat satu bait pupuh sesuai dengan aturan guru lagu dan guru wilangan.", deadlineDays: 14 },
      { judul: "Menerjemahkan Teks Sunda", detail: "Terjemahkan teks dongeng atau cerita rakyat Sunda ke dalam bahasa Indonesia.", deadlineDays: 10 },
      { judul: "Proyek Budaya Lokal Sumedang", detail: "Buat laporan proyek tentang salah satu kesenian atau tradisi khas Sumedang.", deadlineDays: 28 },
    ],
    "Geografi": [
      { judul: "Analisis Peta Topografi", detail: "Analisis peta topografi wilayah Sumedang dan identifikasi fitur geografisnya.", deadlineDays: 10 },
      { judul: "Laporan Observasi Lingkungan", detail: "Lakukan observasi lingkungan sekitar dan buat laporan tentang kondisi geografisnya.", deadlineDays: 21 },
      { judul: "Makalah Bencana Alam", detail: "Buat makalah tentang bencana alam di Indonesia dan upaya mitigasinya.", deadlineDays: 28 },
    ],
    "Sosiologi": [
      { judul: "Mini Riset Sosial", detail: "Lakukan mini riset tentang struktur sosial di lingkungan tempat tinggal.", deadlineDays: 21 },
      { judul: "Analisis Kasus Konflik", detail: "Analisis sebuah kasus konflik sosial dan tawarkan solusi integrasi.", deadlineDays: 14 },
      { judul: "Esai Perubahan Sosial", detail: "Tulis esai tentang dampak globalisasi terhadap perubahan sosial di masyarakat.", deadlineDays: 10 },
    ],
    "Ekonomi": [
      { judul: "Analisis Grafik Ekonomi", detail: "Analisis grafik permintaan dan penawaran untuk menentukan titik keseimbangan pasar.", deadlineDays: 7 },
      { judul: "Studi Kasus Kebijakan Pemerintah", detail: "Analisis dampak kebijakan fiskal dan moneter terhadap perekonomian Indonesia.", deadlineDays: 21 },
      { judul: "Laporan Survei Pasar", detail: "Lakukan survei pasar tentang kebutuhan konsumen dan buat laporan hasilnya.", deadlineDays: 28 },
    ],
    "Akuntansi": [
      { judul: "Latihan Jurnal Transaksi", detail: "Catat 20 transaksi perusahaan jasa ke dalam jurnal umum.", deadlineDays: 10 },
      { judul: "Menyusun Laporan Laba-Rugi", detail: "Susun laporan laba rugi berdasarkan data neraca saldo yang diberikan.", deadlineDays: 14 },
      { judul: "Studi Kasus Perusahaan Jasa", detail: "Selesaikan siklus akuntansi lengkap untuk perusahaan jasa fiktif.", deadlineDays: 28 },
    ],
    "Sejarah Peminatan": [
      { judul: "Makalah Komparatif Sejarah", detail: "Buat makalah perbandingan antara Revolusi Perancis dan Revolusi Indonesia.", deadlineDays: 28 },
      { judul: "Peta Konsep Perang Dunia", detail: "Buat peta konsep yang menghubungkan penyebab, jalannya, dan dampak Perang Dunia II.", deadlineDays: 14 },
      { judul: "Presentasi Tokoh Sejarah Dunia", detail: "Buat presentasi tentang salah satu tokoh sejarah dunia dan perannya.", deadlineDays: 10 },
    ],
  };

  const tugasData = [];
  for (let i = 0; i < createdMatkul.length; i++) {
    const mk = createdMatkul[i];
    const baseName = matkulList[i].namaBase;
    const templates = tugasMap[baseName] || tugasMap["Bahasa Indonesia"];
    for (const tmpl of templates) {
      for (const s of siswaList) {
        if (s.idKelas !== mk.idKelas) continue;
        const deadlineDate = new Date(
          today.getTime() + tmpl.deadlineDays * 24 * 3600000,
        );
        tugasData.push({
          idMataKuliah: mk.idMataKuliah,
          nis: s.ni,
          judul: tmpl.judul,
          detailTugas: tmpl.detail,
          deadlineTugas: deadlineDate,
        });
      }
    }
  }
  await prisma.tugas.createMany({ data: tugasData });
  console.log(`${tugasData.length} Tugas berhasil dibuat.`);

  // ══════════════════════════════════════════════
  // 9. KUIS
  // ══════════════════════════════════════════════
  const createdKuis = [];
  for (let i = 0; i < createdMatkul.length; i++) {
    const mk = createdMatkul[i];
    const kuis = await prisma.kuis.create({
      data: {
        idMataKuliah: mk.idMataKuliah,
        judul: `Kuis - ${matkulList[i].nama}`,
        deadlineKuis: new Date(today.getTime() + 14 * 24 * 3600000),
        skor: 100,
      },
    });
    createdKuis.push(kuis);
  }
  console.log(`${createdKuis.length} Kuis berhasil dibuat.`);

  // ══════════════════════════════════════════════
  // 10. SOAL & PILIHAN JAWABAN
  // ══════════════════════════════════════════════
  for (const kuis of createdKuis) {
    for (let q = 1; q <= 2; q++) {
      const soal = await prisma.soal.create({
        data: {
          idKuis: kuis.idKuis,
          pertanyaan: `Pertanyaan ${q}: Jelaskan konsep dasar terkait materi kuis ini.`,
          kunciJawaban: "A",
          skor: 50,
        },
      });
      await prisma.pilihanJawaban.createMany({
        data: [
          { idSoal: soal.idSoal, teksJawaban: "Jawaban A (Benar)" },
          { idSoal: soal.idSoal, teksJawaban: "Jawaban B" },
          { idSoal: soal.idSoal, teksJawaban: "Jawaban C" },
          { idSoal: soal.idSoal, teksJawaban: "Jawaban D" },
        ],
      });
    }
  }
  console.log("Soal & Pilihan Jawaban berhasil dibuat.");

  // ══════════════════════════════════════════════
  // 11. FORUM DISKUSI
  // ══════════════════════════════════════════════
  const forumCreated = [];
  const matkulSemester4 = matkulList.filter((m) => m.semester === 4);
  for (let i = 0; i < matkulSemester4.length; i++) {
    const mk = createdMatkul.find(
      (c) => c.namaMataKuliah === matkulSemester4[i].nama && c.semester === 4,
    );
    if (!mk) continue;
    const forum = await prisma.forumDiskusi.create({
      data: {
        idMataKuliah: mk.idMataKuliah,
        judul: `Diskusi: ${matkulSemester4[i].nama} - Pertemuan 1`,
        isiForum: `Selamat datang di forum diskusi ${matkulSemester4[i].nama}. Silakan bertanya atau berdiskusi mengenai materi pertemuan pertama.`,
        nomorInduk: guruList[i % guruList.length].ni,
      },
    });
    forumCreated.push(forum);
  }
  console.log(`${forumCreated.length} Forum Diskusi berhasil dibuat.`);

  // ══════════════════════════════════════════════
  // 12. KOMENTAR FORUM
  // ══════════════════════════════════════════════
  const komentarData = [];
  for (let i = 0; i < forumCreated.length; i++) {
    komentarData.push({
      nomorInduk: siswaList[(i * 2) % siswaList.length].ni,
      idForum: forumCreated[i].idForumDiskusi,
      isiKomentar:
        "Terima kasih Pak/Bu, materinya sangat bermanfaat. Apakah ada referensi tambahan?",
    });
    komentarData.push({
      nomorInduk: siswaList[(i * 2 + 1) % siswaList.length].ni,
      idForum: forumCreated[i].idForumDiskusi,
      isiKomentar:
        "Saya ingin bertanya mengenai topik yang dibahas di slide ke-3.",
    });
  }
  await prisma.komentarForum.createMany({ data: komentarData });
  console.log(`${komentarData.length} Komentar Forum berhasil dibuat.`);

  // ══════════════════════════════════════════════
  // 13. LIKE FORUM
  // ══════════════════════════════════════════════
  const likeData = [];
  for (let i = 0; i < forumCreated.length; i++) {
    for (let j = 0; j < 3; j++) {
      likeData.push({
        nomorInduk: siswaList[(i + j) % siswaList.length].ni,
        idForum: forumCreated[i].idForumDiskusi,
      });
    }
  }
  await prisma.likeForum.createMany({ data: likeData, skipDuplicates: true });
  console.log(`${likeData.length} Like Forum berhasil dibuat.`);

  // ══════════════════════════════════════════════
  // 14. KELOMPOK
  // ══════════════════════════════════════════════
  const kelompokCreated = [];
  const warna = ["#4b53bc", "#2f9696", "#c47f17", "#dc2626", "#059669"];
  for (let i = 0; i < createdMatkul.length; i++) {
    const mk = createdMatkul[i];
    const k1 = await prisma.kelompok.create({
      data: {
        idMataKuliah: mk.idMataKuliah,
        namaKelompok: `Kelompok 1 - ${matkulList[i].nama}`,
        warna: warna[i % warna.length],
        tugasName: `Proyek Akhir ${matkulList[i].nama}`,
        progress: 60,
        status: "In Progress",
        submitted: false,
      },
    });
    const k2 = await prisma.kelompok.create({
      data: {
        idMataKuliah: mk.idMataKuliah,
        namaKelompok: `Kelompok 2 - ${matkulList[i].nama}`,
        warna: warna[(i + 1) % warna.length],
        tugasName: `Proyek Akhir ${matkulList[i].nama}`,
        progress: 35,
        status: "In Progress",
        submitted: false,
      },
    });
    kelompokCreated.push(k1, k2);
  }
  console.log(`${kelompokCreated.length} Kelompok berhasil dibuat.`);

  // ══════════════════════════════════════════════
  // 15. ANGGOTA KELOMPOK
  // ══════════════════════════════════════════════
  const anggotaData = [];
  for (let ki = 0; ki < kelompokCreated.length; ki++) {
    const k = kelompokCreated[ki];
    const subject = createdMatkul.find(m => m.idMataKuliah === k.idMataKuliah);
    const classSiswaList = siswaList.filter(s => s.idKelas === subject.idKelas);
    const shuffled = [...classSiswaList].sort(() => Math.random() - 0.5);
    for (let j = 0; j < Math.min(5, shuffled.length); j++) {
      anggotaData.push({
        idKelompok: k.idKelompok,
        nis: shuffled[j].ni,
        nilaiTugas: 75 + Math.floor(Math.random() * 20),
      });
    }
  }
  await prisma.anggotaKelompok.createMany({
    data: anggotaData,
    skipDuplicates: true,
  });
  console.log(`${anggotaData.length} Anggota Kelompok berhasil dibuat.`);

  // ══════════════════════════════════════════════
  // 16. PROGRESS TUGAS
  // ══════════════════════════════════════════════
  const progressData = [];
  for (let i = 0; i < createdMatkul.length; i++) {
    const mk = createdMatkul[i];
    const classSiswaList = siswaList.filter(s => s.idKelas === mk.idKelas);
    for (let j = 0; j < Math.min(10, classSiswaList.length); j++) {
      progressData.push({
        idMataKuliah: mk.idMataKuliah,
        nis: classSiswaList[j].ni,
        judul: `Progress Tugas 1 - ${matkulList[i].nama}`,
        detailTugas: "Sudah mengerjakan 50% bagian teori dan praktikum.",
        deadlineTugas: new Date(today.getTime() + 14 * 24 * 3600000),
      });
    }
  }
  await prisma.progressTugas.createMany({ data: progressData });
  console.log(`${progressData.length} Progress Tugas berhasil dibuat.`);

  // ══════════════════════════════════════════════
  // 17. PENGUMPULAN TUGAS
  // ══════════════════════════════════════════════
  const tugasFromDB = await prisma.tugas.findMany();
  const pengumpulanData = [];
  for (let i = 0; i < createdMatkul.length; i++) {
    const mkTugas = tugasFromDB.filter(
      (t) => t.idMataKuliah === createdMatkul[i].idMataKuliah,
    );
    for (let j = 0; j < 2 && j < mkTugas.length; j++) {
      const t = mkTugas[j];
      pengumpulanData.push({
        idTugas: t.idTugas,
        nis: t.nis,
        judul: `Submission: ${t.judul}`,
        detailTugas: "Berikut terlampir file jawaban tugas.",
        fileJawaban: `/uploads/jawaban_${t.nis}_mk${t.idMataKuliah}.pdf`,
      });
    }
  }
  await prisma.pengumpulanTugas.createMany({ data: pengumpulanData });
  console.log(`${pengumpulanData.length} Pengumpulan Tugas berhasil dibuat.`);

  // ══════════════════════════════════════════════
  // 18. NOTIFIKASI
  // ══════════════════════════════════════════════
  const sem4Matkul = createdMatkul.filter((m) => m.semester === 4);
  const notifData = [];
  for (const mk of sem4Matkul) {
    const classSiswaList = siswaList.filter(s => s.idKelas === mk.idKelas);
    if (classSiswaList.length > 0) {
      notifData.push({
        nis: classSiswaList[0].ni,
        judul: "Materi Baru",
        pesan: `Materi untuk mata pelajaran ${mk.namaMataKuliah} telah tersedia. Silakan dipelajari!`,
        tipe: "materi",
        isRead: false,
        tipeRef: "materi",
      });
      notifData.push({
        nis: classSiswaList[0].ni,
        judul: "Tugas Baru",
        pesan: `Tugas baru telah tersedia untuk mata pelajaran ${mk.namaMataKuliah}. Jangan lupa dikerjakan!`,
        tipe: "tugas",
        isRead: false,
        tipeRef: "tugas",
      });
    }
  }
  await prisma.notifikasi.createMany({ data: notifData });
  console.log(`${notifData.length} Notifikasi berhasil dibuat.`);

  // ══════════════════════════════════════════════
  // SELESAI
  // ══════════════════════════════════════════════
  console.log("");
  console.log("═══════════════════════════════════════════");
  console.log("  SEEDING SELESAI!");
  console.log("═══════════════════════════════════════════");
  console.log("");
  console.log("Ringkasan Data:");
  console.log("  - 2 Jurusan (MIPA, IPS)");
  console.log(`  - ${createdKelas.length} Kelas`);
  console.log("  - 3 Role (Admin, Siswa, Guru)");
  console.log(`  - ${guruList.length} Guru`);
  console.log(`  - ${siswaList.length} Siswa (10 per kelas)`);
  console.log(`  - ${matkulList.length} Mata Pelajaran`);
  console.log(`    - MIPA: ${mipaMatkulTemplates.length} mapel/kelas x 6 kelas = ${mipaMatkulTemplates.length * 6}`);
  console.log(`    - IPS: ${ipsMatkulTemplates.length} mapel/kelas x 3 kelas = ${ipsMatkulTemplates.length * 3}`);
  console.log("");
  console.log("Akun Login (password: password123):");
  console.log("  Guru:");
  for (const g of guruList) {
    console.log(`    ${g.ni} | ${g.nama}`);
  }
  console.log("  Siswa (contoh):");
  console.log(`    ${siswaList[0].ni} | ${siswaList[0].nama}`);
  console.log(`    ${siswaList[10].ni} | ${siswaList[10].nama}`);
  console.log("");
}

main()
  .catch((e) => {
    console.error("Seeding gagal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
