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
  // 3. GURU (5 Guru)
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
      email: "siti.rayahu@sch.id",
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
      bidang: "Sains",
      ruangKantor: "Ruang Guru Lt.1 R.103",
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
  console.log("5 Guru berhasil dibuat.");

  // ══════════════════════════════════════════════
  // 3. SISWA (90 Siswa — 10 per kelas)
  // ══════════════════════════════════════════════
  const namaDepan = ["Andi", "Bella", "Cahya", "Dina", "Eko", "Fitri", "Galih", "Hana", "Irfan", "Jasmine"];
  const namaBelakang = ["Pratama", "Safitri", "Nugraha", "Maharani", "Saputra", "Handayani", "Wicaksono", "Permata", "Maulana", "Putri"];

  const siswaList = [];
  for (let ki = 0; ki < createdKelas.length; ki++) {
    const kelas = createdKelas[ki];
    for (let si = 0; si < 10; si++) {
      const nis = `2027${String(ki + 1).padStart(2, "0")}${String(si + 1).padStart(2, "0")}`;
      siswaList.push({
        ni: nis,
        nis: nis,
        nama: `${namaDepan[si]} ${namaBelakang[si]} (${kelas.namaKelas})`,
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
  // 4. MATA PELAJARAN (51 — per kelas: 6 MIPA / 5 IPS)
  // ══════════════════════════════════════════════
  const mipaMatkulTemplates = [
    { nama: "Matematika Wajib", nipGuru: guruList[0].nip, semester: 1, sks: 3 },
    { nama: "Bahasa Indonesia", nipGuru: guruList[1].nip, semester: 2, sks: 3 },
    { nama: "Bahasa Inggris", nipGuru: guruList[2].nip, semester: 3, sks: 3 },
    { nama: "Fisika", nipGuru: guruList[3].nip, semester: 4, sks: 3 },
    { nama: "Kimia", nipGuru: guruList[4].nip, semester: 1, sks: 3 },
    { nama: "Biologi", nipGuru: guruList[0].nip, semester: 2, sks: 3 },
  ];
  const ipsMatkulTemplates = [
    { nama: "Matematika Wajib", nipGuru: guruList[0].nip, semester: 1, sks: 3 },
    { nama: "Bahasa Indonesia", nipGuru: guruList[1].nip, semester: 2, sks: 3 },
    { nama: "Bahasa Inggris", nipGuru: guruList[2].nip, semester: 3, sks: 3 },
    { nama: "Ekonomi", nipGuru: guruList[3].nip, semester: 4, sks: 3 },
    { nama: "Sosiologi", nipGuru: guruList[4].nip, semester: 1, sks: 3 },
  ];
  const jadwalMipa = ["Senin,Rabu", "Selasa,Kamis", "Rabu,Jumat", "Senin,Kamis", "Selasa,Jumat", "Rabu,Kamis"];
  const jadwalIps = ["Senin,Rabu", "Selasa,Kamis", "Rabu,Jumat", "Senin,Kamis", "Selasa,Jumat"];

  const matkulList = [];
  const createdMatkul = [];
  for (let ki = 0; ki < createdKelas.length; ki++) {
    const kelas = createdKelas[ki];
    const templates = kelas.idJurusan === 1 ? mipaMatkulTemplates : ipsMatkulTemplates;
    const jadwals = kelas.idJurusan === 1 ? jadwalMipa : jadwalIps;
    for (let ti = 0; ti < templates.length; ti++) {
      const tmpl = templates[ti];
      const fullName = `${tmpl.nama} ${kelas.namaKelas}`;
      matkulList.push({
        nama: fullName,
        nipGuru: tmpl.nipGuru,
        idKelas: kelas.idKelas,
        jadwal: jadwals[ti],
        waktu: `${8 + ti * 2}:00 - ${10 + ti * 2}:00`,
        semester: tmpl.semester,
        sks: tmpl.sks,
      });
      const created = await prisma.mataKuliah.create({
        data: {
          namaMataKuliah: fullName,
          nipGuru: tmpl.nipGuru,
          idKelas: kelas.idKelas,
          jadwal: jadwals[ti],
          waktu: `${8 + ti * 2}:00 - ${10 + ti * 2}:00`,
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
    "Hadir",
    "Hadir",
    "Hadir",
    "Hadir",
    "Hadir",
    "Hadir",
    "Hadir",
    "Sakit",
    "Izin",
    "Alpha",
  ];

  const presensiData = [];
  for (const mk of createdMatkul) {
    for (const s of siswaList) {
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
  // 7. MODUL AJAR
  // ══════════════════════════════════════════════
  const modulData = [];
  for (let i = 0; i < createdMatkul.length; i++) {
    const mk = createdMatkul[i];
    modulData.push({
      idMataKuliah: mk.idMataKuliah,
      judul: `Pengantar ${matkulList[i].nama}`,
      tipe_modul: "PDF",
      deskripsi: `Materi pengantar dan silabus untuk ${matkulList[i].nama}.`,
      fileUrl: `/uploads/modul_pengantar_${mk.idMataKuliah}.pdf`,
      ukuran: "2.5 MB",
      canDownload: true,
    });
    modulData.push({
      idMataKuliah: mk.idMataKuliah,
      judul: `Praktikum ${matkulList[i].nama}`,
      tipe_modul: "Video",
      deskripsi: `Video pembelajaran praktikum untuk ${matkulList[i].nama}.`,
      url: "https://www.youtube.com/watch?v=example",
      ukuran: "150 MB",
      canDownload: false,
    });
  }
  await prisma.modulAjar.createMany({ data: modulData });
  console.log(`${modulData.length} Modul Ajar berhasil dibuat.`);

  // ══════════════════════════════════════════════
  // 8. TUGAS
  // ══════════════════════════════════════════════
  const tugasTemplates = [
    // Semester 1
    [
      {
        judul: "Latihan Aljabar dan Persamaan Linier",
        detail:
          "Kerjakan latihan soal persamaan linier satu variabel dan dua variabel pada lembar kerja.",
        deadlineDays: 7,
      },
      {
        judul: "Penerapan Himpunan dalam Kehidupan Sehari-hari",
        detail:
          "Buat laporan analisis tentang penerapan teori himpunan dalam menyelesaikan masalah sehari-hari.",
        deadlineDays: 21,
      },
    ],
    [
      {
        judul: "Pengukuran Fisika dan Ketidakpastian",
        detail:
          "Lakukan percobaan pengukuran panjang menggunakan jangka sorong dan hitung ketidakpastiannya.",
        deadlineDays: 7,
      },
      {
        judul: "Analisis Gerak Lurus Berubah Beraturan (GLBB)",
        detail:
          "Kerjakan 10 soal mengenai analisis grafik dan rumus GLBB pada gerak benda.",
        deadlineDays: 21,
      },
    ],
    [
      {
        judul: "Pengenalan Alat Laboratorium Kimia",
        detail:
          "Buat rangkuman fungsi dan cara penggunaan alat-alat laboratorium kimia dasar beserta simbol bahaya bahan kimia.",
        deadlineDays: 5,
      },
      {
        judul: "Klasifikasi Materi dan Perubahannya",
        detail:
          "Tentukan tipe perubahan fisika dan kimia pada 10 fenomena alam di sekitar kita.",
        deadlineDays: 18,
      },
    ],
    [
      {
        judul: "Pengamatan Sel Hewan dan Tumbuhan",
        detail:
          "Gambarkan struktur sel tumbuhan dan hewan hasil pengamatan mikroskop dan jelaskan perbedaannya.",
        deadlineDays: 10,
      },
      {
        judul: "Klasifikasi Makhluk Hidup 5 Kingdom",
        detail:
          "Buat kunci determinasi sederhana untuk mengklasifikasikan 5 spesies tumbuhan di lingkungan sekitar.",
        deadlineDays: 24,
      },
    ],
    // Semester 2
    [
      {
        judul: "Penyelesaian Sistem Persamaan Linier Tiga Variabel",
        detail:
          "Selesaikan 5 soal SPLTV menggunakan metode eliminasi dan substitusi.",
        deadlineDays: 10,
      },
      {
        judul: "Fungsi Kuadrat dan Grafiknya",
        detail:
          "Gambarkan grafik fungsi kuadrat dan tentukan titik puncak, sumbu simetri, serta pembuat nol fungsi.",
        deadlineDays: 24,
      },
    ],
    [
      {
        judul: "Hukum Newton tentang Gerak",
        detail:
          "Selesaikan soal analisis gaya pada bidang miring kasar menggunakan Hukum II Newton.",
        deadlineDays: 7,
      },
      {
        judul: "Hukum Termodinamika pada Mesin Carnot",
        detail:
          "Hitung efisiensi mesin Carnot berdasarkan suhu reservoir tinggi dan rendah pada 5 kasus berbeda.",
        deadlineDays: 20,
      },
    ],
    [
      {
        judul: "Konfigurasi Elektron Bohr dan Kuantum",
        detail:
          "Tuliskan konfigurasi elektron dan tentukan keempat bilangan kuantum elektron terakhir untuk 10 unsur.",
        deadlineDays: 8,
      },
      {
        judul: "Perbandingan Ikatan Ionik dan Kovalen",
        detail:
          "Buat tabel perbandingan sifat fisik senyawa ionik dan senyawa kovalen disertai contoh.",
        deadlineDays: 22,
      },
    ],
    [
      {
        judul: "Analisis Sistem Pencernaan Manusia",
        detail:
          "Buat infografis alur pencernaan makanan dan organ pencernaan serta enzim yang berperan.",
        deadlineDays: 6,
      },
      {
        judul: "Mekanisme Sistem Peredaran Darah",
        detail:
          "Gambarkan bagan sistem peredaran darah besar dan kecil pada manusia beserta fungsinya.",
        deadlineDays: 18,
      },
    ],
    // Semester 3
    [
      {
        judul: "Matriks dan Operasi Dasar",
        detail:
          "Lakukan operasi penjumlahan, perkalian, dan transpose pada matriks berordo 3x3.",
        deadlineDays: 10,
      },
      {
        judul: "Determinan dan Invers Matriks",
        detail:
          "Tentukan determinan dan invers dari matriks yang diberikan menggunakan metode adjoin.",
        deadlineDays: 24,
      },
    ],
    [
      {
        judul: "Sifat-Sifat Gelombang Cahaya",
        detail:
          "Jelaskan fenomena difraksi, interferensi, dan polarisasi cahaya dalam kehidupan sehari-hari.",
        deadlineDays: 5,
      },
      {
        judul: "Hukum Ohm dan Rangkaian Listrik",
        detail:
          "Hitung kuat arus dan tegangan pada rangkaian listrik campuran menggunakan Hukum Ohm dan Kirchhoff.",
        deadlineDays: 16,
      },
    ],
    [
      {
        judul: "Penentuan Entalpi Reaksi",
        detail:
          "Hitung perubahan entalpi reaksi netralisasi menggunakan kalorimeter sederhana.",
        deadlineDays: 7,
      },
      {
        judul: "Faktor-Faktor yang Mempengaruhi Laju Reaksi",
        detail:
          "Buat laporan praktikum pengaruh suhu dan konsentrasi terhadap laju reaksi kimia.",
        deadlineDays: 20,
      },
    ],
    [
      {
        judul: "Hukum Mendel tentang Persilangan",
        detail:
          "Selesaikan soal persilangan monohibrid dan dihibrid beserta rasio fenotip dan genotipnya.",
        deadlineDays: 8,
      },
      {
        judul: "Bukti-Bukti Teori Evolusi",
        detail:
          "Buat esai analisis komparatif bukti homologi organ tubuh hewan sebagai bukti evolusi.",
        deadlineDays: 22,
      },
    ],
    // Semester 4 (Active)
    [
      {
        judul: "Konsep Turunan Fungsi Aljabar",
        detail:
          "Selesaikan 10 soal turunan fungsi aljabar menggunakan aturan rantai dan turunan dasar.",
        deadlineDays: 7,
      },
      {
        judul: "Aplikasi Turunan dalam Masalah Maksimum/Minimum",
        detail:
          "Selesaikan masalah optimasi luas bidang tanah menggunakan konsep turunan pertama.",
        deadlineDays: 21,
      },
    ],
    [
      {
        judul: "Efek Fotolistrik dan Teori Kuantum Planck",
        detail:
          "Jelaskan konsep efek fotolistrik dan hitung energi kinetik elektron yang lepas dari permukaan logam.",
        deadlineDays: 5,
      },
      {
        judul: "Klasifikasi Bintang dan Hukum Kepler",
        detail:
          "Tentukan periode revolusi planet menggunakan Hukum III Kepler pada sistem tata surya.",
        deadlineDays: 18,
      },
    ],
    [
      {
        judul: "Tata Nama Senyawa Hidrokarbon Alkana Alkena Alkuna",
        detail:
          "Tuliskan nama IUPAC dan struktur molekul untuk 10 senyawa hidrokarbon.",
        deadlineDays: 12,
      },
      {
        judul: "Identifikasi Gugus Fungsi Senyawa Karbon",
        detail:
          "Lakukan analisis cara membedakan senyawa alkohol dan eter melalui reaksi kimia.",
        deadlineDays: 28,
      },
    ],
    [
      {
        judul: "Analisis Jaring-Jaring Makanan dan Aliran Energi",
        detail:
          "Gambarkan diagram jaring-jaring makanan pada ekosistem hutan dan hitung transfer energinya.",
        deadlineDays: 8,
      },
      {
        judul: "Dampak Pencemaran Lingkungan dan Solusinya",
        detail:
          "Buat artikel ulasan ilmiah mengenai dampak mikroplastik di ekosistem perairan lokal.",
        deadlineDays: 22,
      },
    ],
  ];

  const tugasData = [];
  for (let i = 0; i < createdMatkul.length; i++) {
    const mk = createdMatkul[i];
    const templates = tugasTemplates[i % tugasTemplates.length];
    for (const tmpl of templates) {
      for (const s of siswaList) {
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
  console.log(
    `${tugasData.length} Tugas berhasil dibuat.`
  );

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
  console.log(
    `${createdKuis.length} Kuis berhasil dibuat.`
  );

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
  console.log(
    "Soal & Pilihan Jawaban berhasil dibuat."
  );

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
    const shuffled = [...siswaList].sort(() => Math.random() - 0.5);
    for (let j = 0; j < 5; j++) {
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
    for (let j = 0; j < Math.min(10, siswaList.length); j++) {
      progressData.push({
        idMataKuliah: mk.idMataKuliah,
        nis: siswaList[(i + j) % siswaList.length].ni,
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
    notifData.push({
      nis: siswaList[0].ni,
      judul: "Materi Baru",
      pesan: `Materi "Pengantar ${mk.namaMataKuliah}" untuk mata pelajaran ${mk.namaMataKuliah} telah tersedia. Silakan dipelajari!`,
      tipe: "materi",
      isRead: false,
      tipeRef: "materi",
    });
    notifData.push({
      nis: siswaList[0].ni,
      judul: "Tugas Baru",
      pesan: `Tugas baru telah tersedia untuk mata pelajaran ${mk.namaMataKuliah}. Jangan lupa dikerjakan!`,
      tipe: "tugas",
      isRead: false,
      tipeRef: "tugas",
    });
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
  console.log("  - 5 Guru");
  console.log(`  - ${siswaList.length} Siswa (10 per kelas)`);
  console.log(`  - ${matkulList.length} Mata Pelajaran`);
  console.log("");
  console.log("Akun Login:");
  console.log("  Guru  -> D001 / password123");
  console.log(`  Siswa -> ${siswaList[0].ni} / password123`);
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
