// Seed file untuk dummy data Materi dan Kuis
// Jalankan: node prisma/seed-dummy.js

import { prisma } from "../lib/prisma.ts";

async function main() {
  console.log('🌱 Membuat dummy data...');

  // ID mata kuliah dari semester aktif (sesuaikan dengan database)
  const mataKuliahIds = [13, 14, 15, 16]; // Pemrograman Web, Kecerdasan Buatan, RPL, IMK

  // ====== DUMMY MATERI PDF ======
  console.log('📄 Membuat materi PDF...');
  
  const pdfMaterials = [
    {
      idMataKuliah: 13, // Matematika Wajib XI
      judul: 'Konsep Turunan Fungsi Aljabar',
      tipe_modul: 'PDF',
      deskripsi: 'Modul dasar turunan fungsi aljabar beserta rumus-rumus dasarnya.',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      ukuran: '12 KB',
    },
    {
      idMataKuliah: 13,
      judul: 'Aplikasi Turunan Fungsi',
      tipe_modul: 'PDF',
      deskripsi: 'Panduan pemecahan masalah optimasi dan nilai ekstrem menggunakan turunan.',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf#deriv',
      ukuran: '12 KB',
    },
    {
      idMataKuliah: 15, // Kimia Organik dan Makromolekul
      judul: 'Tata Nama Senyawa Hidrokarbon',
      tipe_modul: 'PDF',
      deskripsi: 'Panduan tata nama IUPAC untuk Alkana, Alkena, dan Alkuna.',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf#kimia',
      ukuran: '12 KB',
    },
    {
      idMataKuliah: 14, // Fisika Modern dan Astronomi
      judul: 'Teori Relativitas Khusus',
      tipe_modul: 'PDF',
      deskripsi: 'Modul pembahasan dilatasi waktu, kontraksi panjang, dan kesetaraan massa-energi Einstein.',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf#fisika',
      ukuran: '12 KB',
    },
  ];

  for (const materi of pdfMaterials) {
    await prisma.modulAjar.upsert({
      where: { 
        idModulAjar: await getOrCreateId(prisma.modulAjar, { url: materi.url }, materi) 
      },
      update: materi,
      create: materi,
    });
  }

  // ====== DUMMY MATERI VIDEO ======
  console.log('🎥 Membuat materi Video...');
  
  const videoMaterials = [
    {
      idMataKuliah: 13, // Matematika Wajib XI
      judul: 'Tutorial Turunan Fungsi Aljabar',
      tipe_modul: 'Video',
      deskripsi: 'Video pembahasan contoh soal turunan fungsi aljabar.',
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      ukuran: 'N/A (Streaming)',
    },
    {
      idMataKuliah: 15, // Kimia Organik
      judul: 'Identifikasi Gugus Fungsi Karbon',
      tipe_modul: 'Video',
      deskripsi: 'Video eksperimen reaksi identifikasi alkohol, aldehida, dan keton.',
      url: 'https://www.youtube.com/embed/OkC7i2Xqx8o',
      ukuran: 'N/A (Streaming)',
    },
    {
      idMataKuliah: 14, // Fisika Modern
      judul: 'Penjelasan Efek Fotolistrik',
      tipe_modul: 'Video',
      deskripsi: 'Animasi konsep pelepasan elektron akibat radiasi elektromagnetik.',
      url: 'https://www.youtube.com/embed/aircAruvnKk',
      ukuran: 'N/A (Streaming)',
    },
    {
      idMataKuliah: 16, // Ekologi
      judul: 'Dinamika Ekosistem dan Aliran Energi',
      tipe_modul: 'Video',
      deskripsi: 'Video penjelasan interaksi biotik-abiotik dan piramida ekologi.',
      url: 'https://www.youtube.com/embed/QbTBoR7v9gg',
      ukuran: 'N/A (Streaming)',
    },
  ];

  for (const materi of videoMaterials) {
    await prisma.modulAjar.upsert({
      where: { 
        idModulAjar: await getOrCreateId(prisma.modulAjar, { url: materi.url }, materi) 
      },
      update: materi,
      create: materi,
    });
  }

  // ====== DUMMY KUIS DENGAN SOAL ======
  console.log('📝 Membuat Kuis dan Soal...');

  // Kuis 1: Matematika Wajib XI
  const kuis1 = await prisma.kuis.upsert({
    where: { idKuis: 1 },
    update: {},
    create: {
      idKuis: 1,
      idMataKuliah: 13,
      judul: 'Kuis Turunan Fungsi Aljabar',
      deadlineKuis: new Date('2025-12-31T23:59:59'),
      skor: 100,
    },
  });

  // Soal untuk Kuis 1
  const soalKuis1 = [
    {
      pertanyaan: 'Turunan pertama dari f(x) = 3x^2 + 5x - 2 adalah?',
      kunciJawaban: 'B',
      skor: 25,
      pilihanJawaban: [
        { teksJawaban: '3x + 5' },
        { teksJawaban: '6x + 5' },
        { teksJawaban: '6x - 2' },
        { teksJawaban: '3x^2 + 5' },
      ],
    },
    {
      pertanyaan: 'Nilai turunan f(x) = x^3 di titik x = 2 adalah?',
      kunciJawaban: 'C',
      skor: 25,
      pilihanJawaban: [
        { teksJawaban: '4' },
        { teksJawaban: '8' },
        { teksJawaban: '12' },
        { teksJawaban: '6' },
      ],
    },
    {
      pertanyaan: 'Turunan dari f(x) = sin(x) adalah?',
      kunciJawaban: 'A',
      skor: 25,
      pilihanJawaban: [
        { teksJawaban: 'cos(x)' },
        { teksJawaban: '-cos(x)' },
        { teksJawaban: 'tan(x)' },
        { teksJawaban: 'sec(x)' },
      ],
    },
    {
      pertanyaan: 'Jika f(x) = 5, maka f\'(x) adalah?',
      kunciJawaban: 'D',
      skor: 25,
      pilihanJawaban: [
        { teksJawaban: '5' },
        { teksJawaban: '1' },
        { teksJawaban: 'x' },
        { teksJawaban: '0' },
      ],
    },
  ];

  for (const soalData of soalKuis1) {
    const soal = await prisma.soal.create({
      data: {
        idKuis: kuis1.idKuis,
        pertanyaan: soalData.pertanyaan,
        kunciJawaban: soalData.kunciJawaban,
        skor: soalData.skor,
      },
    });

    for (const pilihan of soalData.pilihanJawaban) {
      await prisma.pilihanJawaban.create({
        data: {
          idSoal: soal.idSoal,
          teksJawaban: pilihan.teksJawaban,
        },
      });
    }
  }

  // Kuis 2: Kimia Organik dan Makromolekul
  const kuis2 = await prisma.kuis.upsert({
    where: { idKuis: 2 },
    update: {},
    create: {
      idKuis: 2,
      idMataKuliah: 15,
      judul: 'Kuis Senyawa Hidrokarbon',
      deadlineKuis: new Date('2025-12-31T23:59:59'),
      skor: 100,
    },
  });

  const soalKuis2 = [
    {
      pertanyaan: 'Rumus umum untuk senyawa golongan alkana adalah?',
      kunciJawaban: 'B',
      skor: 25,
      pilihanJawaban: [
        { teksJawaban: 'CnH2n' },
        { teksJawaban: 'CnH2n+2' },
        { teksJawaban: 'CnH2n-2' },
        { teksJawaban: 'CnHn' },
      ],
    },
    {
      pertanyaan: 'Senyawa hidrokarbon paling sederhana adalah?',
      kunciJawaban: 'A',
      skor: 25,
      pilihanJawaban: [
        { teksJawaban: 'Metana' },
        { teksJawaban: 'Etana' },
        { teksJawaban: 'Propana' },
        { teksJawaban: 'Butana' },
      ],
    },
    {
      pertanyaan: 'Gugus fungsi -OH merupakan penanda untuk golongan senyawa?',
      kunciJawaban: 'C',
      skor: 25,
      pilihanJawaban: [
        { teksJawaban: 'Eter' },
        { teksJawaban: 'Alkanal' },
        { teksJawaban: 'Alkohol (Alkanol)' },
        { teksJawaban: 'Asam karboksilat' },
      ],
    },
    {
      pertanyaan: 'Reaksi antara alkana dengan halogen disebut reaksi?',
      kunciJawaban: 'D',
      skor: 25,
      pilihanJawaban: [
        { teksJawaban: 'Adisi' },
        { teksJawaban: 'Eliminasi' },
        { teksJawaban: 'Oksidasi' },
        { teksJawaban: 'Substitusi' },
      ],
    },
  ];

  for (const soalData of soalKuis2) {
    const soal = await prisma.soal.create({
      data: {
        idKuis: kuis2.idKuis,
        pertanyaan: soalData.pertanyaan,
        kunciJawaban: soalData.kunciJawaban,
        skor: soalData.skor,
      },
    });

    for (const pilihan of soalData.pilihanJawaban) {
      await prisma.pilihanJawaban.create({
        data: {
          idSoal: soal.idSoal,
          teksJawaban: pilihan.teksJawaban,
        },
      });
    }
  }

  // Kuis 3: Fisika Modern dan Astronomi
  const kuis3 = await prisma.kuis.upsert({
    where: { idKuis: 3 },
    update: {},
    create: {
      idKuis: 3,
      idMataKuliah: 14,
      judul: 'Kuis Teori Relativitas dan Kuantum',
      deadlineKuis: new Date('2025-12-31T23:59:59'),
      skor: 100,
    },
  });

  const soalKuis3 = [
    {
      pertanyaan: 'Postulat pertama relativitas khusus Einstein menyatakan bahwa?',
      kunciJawaban: 'B',
      skor: 25,
      pilihanJawaban: [
        { teksJawaban: 'Kecepatan cahaya selalu berubah' },
        { teksJawaban: 'Hukum fisika adalah sama dalam semua kerangka acuan inersia' },
        { teksJawaban: 'Massa benda selalu tetap' },
        { teksJawaban: 'Waktu mutlak bagi semua pengamat' },
      ],
    },
    {
      pertanyaan: 'Tokoh yang mengemukakan bahwa cahaya terdiri dari paket-paket energi (foton) adalah?',
      kunciJawaban: 'A',
      skor: 25,
      pilihanJawaban: [
        { teksJawaban: 'Max Planck / Albert Einstein' },
        { teksJawaban: 'Isaac Newton' },
        { teksJawaban: 'Niels Bohr' },
        { teksJawaban: 'Ernest Rutherford' },
      ],
    },
    {
      pertanyaan: 'Dalam efek fotolistrik, elektron dapat keluar dari logam jika?',
      kunciJawaban: 'C',
      skor: 25,
      pilihanJawaban: [
        { teksJawaban: 'Intensitas cahaya sangat besar' },
        { teksJawaban: 'Tegangan listrik sangat tinggi' },
        { teksJawaban: 'Frekuensi cahaya lebih besar dari frekuensi ambang' },
        { teksJawaban: 'Suhu logam sangat tinggi' },
      ],
    },
    {
      pertanyaan: 'Rumus kesetaraan massa dan energi yang terkenal dari Einstein adalah?',
      kunciJawaban: 'B',
      skor: 25,
      pilihanJawaban: [
        { teksJawaban: 'E = mc' },
        { teksJawaban: 'E = mc^2' },
        { teksJawaban: 'E = hf' },
        { teksJawaban: 'F = ma' },
      ],
    },
  ];

  for (const soalData of soalKuis3) {
    const soal = await prisma.soal.create({
      data: {
        idKuis: kuis3.idKuis,
        pertanyaan: soalData.pertanyaan,
        kunciJawaban: soalData.kunciJawaban,
        skor: soalData.skor,
      },
    });

    for (const pilihan of soalData.pilihanJawaban) {
      await prisma.pilihanJawaban.create({
        data: {
          idSoal: soal.idSoal,
          teksJawaban: pilihan.teksJawaban,
        },
      });
    }
  }

    console.log('✅ Dummy data berhasil dibuat!');
  console.log(`📄 ${pdfMaterials.length} Materi PDF`);
  console.log(`🎥 ${videoMaterials.length} Materi Video`);
  console.log(`📝 3 Kuis dengan 12 Soal total`);
}

async function getOrCreateId(model, where, data) {
  const existing = await model.findFirst({ where });
  if (existing) return existing.idModulAjar;
  const created = await model.create({ data });
  return created.idModulAjar;
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
