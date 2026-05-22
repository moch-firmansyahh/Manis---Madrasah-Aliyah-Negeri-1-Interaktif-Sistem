import fs from "fs";

const seedPath = "lms-be/prisma/seed.js";

console.log("Starting seed.js modification with marker boundaries...");

if (fs.existsSync(seedPath)) {
  let content = fs.readFileSync(seedPath, "utf8");

  // 1. Replace guruList
  const guruStartMarker = "const guruList = [";
  const guruEndMarker = "for (const g of guruList) {";

  const guruStartIndex = content.indexOf(guruStartMarker);
  const guruEndIndex = content.indexOf(guruEndMarker);

  if (guruStartIndex !== -1 && guruEndIndex !== -1) {
    const newGuruContent = `const guruList = [
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

  `;
    content =
      content.substring(0, guruStartIndex) +
      newGuruContent +
      content.substring(guruEndIndex);
    console.log("guruList updated.");
  } else {
    console.error("Failed to find guruList markers!");
  }

  // 2. Replace siswaList (re-read index because content length changed)
  const siswaStartMarker = "const siswaList = [";
  const siswaEndMarker = "for (const s of siswaList) {";

  const siswaStartIndex = content.indexOf(siswaStartMarker);
  const siswaEndIndex = content.indexOf(siswaEndMarker);

  if (siswaStartIndex !== -1 && siswaEndIndex !== -1) {
    const newSiswaContent = `const siswaList = [
    {
      ni: "2026001",
      nis: "2026001",
      nama: "Andi Pratama",
      email: "andi.pratama@sch.id",
    },
    {
      ni: "2026002",
      nis: "2026002",
      nama: "Bella Safitri",
      email: "bella.safitri@sch.id",
    },
    {
      ni: "2026003",
      nis: "2026003",
      nama: "Cahya Nugraha",
      email: "cahya.nugraha@sch.id",
    },
    {
      ni: "2026004",
      nis: "2026004",
      nama: "Dina Maharani",
      email: "dina.maharani@sch.id",
    },
    {
      ni: "2026005",
      nis: "2026005",
      nama: "Eko Saputra",
      email: "eko.saputra@sch.id",
    },
    {
      ni: "2026006",
      nis: "2026006",
      nama: "Fitri Handayani",
      email: "fitri.handayani@sch.id",
    },
    {
      ni: "2026007",
      nis: "2026007",
      nama: "Galih Wicaksono",
      email: "galih.wicaksono@sch.id",
    },
    {
      ni: "2026008",
      nis: "2026008",
      nama: "Hana Permata",
      email: "hana.permata@sch.id",
    },
    {
      ni: "2026009",
      nis: "2026009",
      nama: "Irfan Maulana",
      email: "irfan.maulana@sch.id",
    },
    {
      ni: "2026010",
      nis: "2026010",
      nama: "Jasmine Putri",
      email: "jasmine.putri@sch.id",
    },
  ];

  `;
    content =
      content.substring(0, siswaStartIndex) +
      newSiswaContent +
      content.substring(siswaEndIndex);
    console.log("siswaList updated.");
  } else {
    console.error("Failed to find siswaList markers!");
  }

  // 3. Replace matkulList
  const matkulStartMarker = "const matkulList = [";
  const matkulEndMarker = "const createdMatkul = [];";

  const matkulStartIndex = content.indexOf(matkulStartMarker);
  const matkulEndIndex = content.indexOf(matkulEndMarker);

  if (matkulStartIndex !== -1 && matkulEndIndex !== -1) {
    const newMatkulContent = `const matkulList = [
    // Semester 1 (Completed)
    {
      nama: "Matematika Dasar I",
      nipGuru: guruList[0].nip,
      jadwal: "Senin,Rabu",
      waktu: "08:00 - 10:00",
      semester: 1,
      sks: 3,
    },
    {
      nama: "Fisika Dasar I",
      nipGuru: guruList[1].nip,
      jadwal: "Selasa,Kamis",
      waktu: "10:30 - 12:00",
      semester: 1,
      sks: 3,
    },
    {
      nama: "Kimia Dasar I",
      nipGuru: guruList[2].nip,
      jadwal: "Rabu,Jumat",
      waktu: "13:00 - 15:00",
      semester: 1,
      sks: 3,
    },
    {
      nama: "Biologi Umum",
      nipGuru: guruList[3].nip,
      jadwal: "Senin,Kamis",
      waktu: "15:30 - 17:00",
      semester: 1,
      sks: 3,
    },
    // Semester 2 (Completed)
    {
      nama: "Matematika Wajib X",
      nipGuru: guruList[4].nip,
      jadwal: "Senin,Rabu",
      waktu: "10:30 - 12:30",
      semester: 2,
      sks: 3,
    },
    {
      nama: "Mekanika dan Termodinamika",
      nipGuru: guruList[1].nip,
      jadwal: "Selasa,Kamis",
      waktu: "08:00 - 10:00",
      semester: 2,
      sks: 3,
    },
    {
      nama: "Struktur Atom dan Ikatan Kimia",
      nipGuru: guruList[2].nip,
      jadwal: "Rabu,Jumat",
      waktu: "10:30 - 12:30",
      semester: 2,
      sks: 3,
    },
    {
      nama: "Sistem Organ Organisme",
      nipGuru: guruList[3].nip,
      jadwal: "Senin,Kamis",
      waktu: "13:00 - 15:00",
      semester: 2,
      sks: 3,
    },
    // Semester 3 (Completed)
    {
      nama: "Matematika Dasar II",
      nipGuru: guruList[0].nip,
      jadwal: "Senin,Rabu",
      waktu: "15:30 - 17:30",
      semester: 3,
      sks: 3,
    },
    {
      nama: "Gelombang, Optik, dan Listrik Magnet",
      nipGuru: guruList[1].nip,
      jadwal: "Selasa,Kamis",
      waktu: "13:00 - 15:00",
      semester: 3,
      sks: 3,
    },
    {
      nama: "Termokimia dan Laju Reaksi",
      nipGuru: guruList[2].nip,
      jadwal: "Rabu,Jumat",
      waktu: "08:00 - 10:00",
      semester: 3,
      sks: 3,
    },
    {
      nama: "Genetika dan Evolusi",
      nipGuru: guruList[3].nip,
      jadwal: "Senin,Kamis",
      waktu: "10:30 - 12:00",
      semester: 3,
      sks: 3,
    },
    // Semester 4 (Active)
    {
      nama: "Matematika Wajib XI",
      nipGuru: guruList[4].nip,
      jadwal: "Senin,Rabu",
      waktu: "13:00 - 15:00",
      semester: 4,
      sks: 3,
    },
    {
      nama: "Fisika Modern dan Astronomi",
      nipGuru: guruList[1].nip,
      jadwal: "Selasa,Kamis",
      waktu: "15:30 - 17:30",
      semester: 4,
      sks: 3,
    },
    {
      nama: "Kimia Organik dan Makromolekul",
      nipGuru: guruList[2].nip,
      jadwal: "Rabu,Jumat",
      waktu: "08:00 - 10:00",
      semester: 4,
      sks: 3,
    },
    {
      nama: "Ekologi dan Lingkungan",
      nipGuru: guruList[3].nip,
      jadwal: "Senin,Kamis",
      waktu: "10:30 - 12:00",
      semester: 4,
      sks: 3,
    },
  ];

  `;
    content =
      content.substring(0, matkulStartIndex) +
      newMatkulContent +
      content.substring(matkulEndIndex);
    console.log("matkulList updated.");
  } else {
    console.error("Failed to find matkulList markers!");
  }

  // 4. Replace tugasTemplates
  const tugasStartMarker = "const tugasTemplates = [";
  const tugasEndMarker = "const tugasData = [];";

  const tugasStartIndex = content.indexOf(tugasStartMarker);
  const tugasEndIndex = content.indexOf(tugasEndMarker);

  if (tugasStartIndex !== -1 && tugasEndIndex !== -1) {
    const newTugasContent = `const tugasTemplates = [
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

  `;
    content =
      content.substring(0, tugasStartIndex) +
      newTugasContent +
      content.substring(tugasEndIndex);
    console.log("tugasTemplates updated.");
  } else {
    console.error("Failed to find tugasTemplates markers!");
  }

  fs.writeFileSync(seedPath, content, "utf8");
  console.log("seed.js successfully modified with marker boundaries!");
} else {
  console.error("seed.js not found!");
}
