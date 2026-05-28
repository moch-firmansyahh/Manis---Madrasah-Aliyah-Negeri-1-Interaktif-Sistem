import { prisma } from "../src/prismaClient.js";
import bcrypt from 'bcrypt';

async function main() {
  console.log("Memulai proses seeding data baru dengan Kelas & Jurusan...");

  // Hapus semua data
  await prisma.likeForum.deleteMany();
  await prisma.komentarForum.deleteMany();
  await prisma.forumDiskusi.deleteMany();
  await prisma.pilihanJawaban.deleteMany();
  await prisma.soal.deleteMany();
  await prisma.jawabanKuis.deleteMany();
  await prisma.kuis.deleteMany();
  await prisma.pengumpulanTugas.deleteMany();
  await prisma.progressTugas.deleteMany();
  await prisma.anggotaKelompok.deleteMany();
  await prisma.kelompok.deleteMany();
  await prisma.notifikasi.deleteMany();
  await prisma.presensi.deleteMany();
  await prisma.tugas.deleteMany();
  await prisma.nilai.deleteMany();
  await prisma.progressMateri.deleteMany();
  await prisma.modulAjar.deleteMany();
  await prisma.mataKuliah.deleteMany();
  await prisma.siswa.deleteMany();
  await prisma.kelas.deleteMany();
  await prisma.jurusan.deleteMany();
  await prisma.guru.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();

  // 1. Roles
  await prisma.role.createMany({
    data: [
      { id: 1, nama: "ADMIN" },
      { id: 2, nama: "SISWA" },
      { id: 3, nama: "GURU" },
    ]
  });

  const hashedPassword = await bcrypt.hash("password123", 10);

  // 2. Jurusan
  const mipa = await prisma.jurusan.create({ data: { namaJurusan: "MIPA" } });
  const ips = await prisma.jurusan.create({ data: { namaJurusan: "IPS" } });

  // 3. Kelas
  const kelasList = [
    { namaKelas: "X MIPA 1", tingkat: 10, idJurusan: mipa.idJurusan },
    { namaKelas: "XI MIPA 1", tingkat: 11, idJurusan: mipa.idJurusan },
    { namaKelas: "XII MIPA 1", tingkat: 12, idJurusan: mipa.idJurusan },
    { namaKelas: "XII MIPA 2", tingkat: 12, idJurusan: mipa.idJurusan },
    { namaKelas: "X IPS 1", tingkat: 10, idJurusan: ips.idJurusan },
    { namaKelas: "XI IPS 1", tingkat: 11, idJurusan: ips.idJurusan },
    { namaKelas: "XII IPS 1", tingkat: 12, idJurusan: ips.idJurusan },
  ];

  const createdKelas = [];
  for (const k of kelasList) {
    createdKelas.push(await prisma.kelas.create({ data: k }));
  }

  // 4. Guru
  const guruList = [
    { ni: "D001", nama: "Budi Santoso, S.Pd", email: "budi.santoso@sch.id", nip: "198001012010011001", bidang: "Matematika" },
    { ni: "D002", nama: "Siti Rahayu, M.Pd", email: "siti.rayahu@sch.id", nip: "197505152005012001", bidang: "Bahasa Inggris" },
    { ni: "D003", nama: "Ahmad Fauzi, S.Si", email: "ahmad.fauzi@sch.id", nip: "198203102010011002", bidang: "Informatika" },
    { ni: "D004", nama: "Dewi Lestari, S.Pd", email: "dewi.lestari@sch.id", nip: "198506202012012001", bidang: "IPS" },
    { ni: "D005", nama: "Rudi Hermawan, M.Si", email: "rudi.hermawan@sch.id", nip: "197912252008011001", bidang: "PKN" },
  ];

  for (const g of guruList) {
    await prisma.user.create({
      data: {
        nomorInduk: g.ni, nama: g.nama, email: g.email, password: hashedPassword, roleId: 3,
        guru: { create: { nip: g.nip, bidang: g.bidang } }
      }
    });
  }

  // 5. Siswa
  const siswaData = [
    { ni: "2026001", nama: "Andi Pratama", email: "andi.pratama@sch.id", idKelas: createdKelas[2].idKelas }, // XII MIPA 1
    { ni: "2026002", nama: "Bella Safitri", email: "bella.safitri@sch.id", idKelas: createdKelas[2].idKelas }, // XII MIPA 1
    { ni: "2026003", nama: "Cahya Nugraha", email: "cahya.nugraha@sch.id", idKelas: createdKelas[3].idKelas }, // XII MIPA 2
    { ni: "2026004", nama: "Dina Maharani", email: "dina.maharani@sch.id", idKelas: createdKelas[3].idKelas }, // XII MIPA 2
    { ni: "2026005", nama: "Eko Saputra", email: "eko.saputra@sch.id", idKelas: createdKelas[6].idKelas }, // XII IPS 1
  ];

  for (const s of siswaData) {
    await prisma.user.create({
      data: {
        nomorInduk: s.ni, nama: s.nama, email: s.email, password: hashedPassword, roleId: 2,
        siswa: { create: { nis: s.ni, idKelas: s.idKelas } }
      }
    });
  }

  // 6. Mata Pelajaran (Per Kelas)
  const mkTemplates = [
    { nama: "Bahasa Inggris", nipGuru: guruList[1].nip },
    { nama: "Matematika Dasar", nipGuru: guruList[0].nip },
    { nama: "Matematika Wajib", nipGuru: guruList[0].nip },
    { nama: "Informatika", nipGuru: guruList[2].nip },
    { nama: "PKN", nipGuru: guruList[4].nip }
  ];

  const ipsOnly = [{ nama: "IPS", nipGuru: guruList[3].nip }];

  const allMatkul = [];

  for (const k of createdKelas) {
    for (const mk of mkTemplates) {
      allMatkul.push(await prisma.mataKuliah.create({
        data: {
          namaMataKuliah: mk.nama,
          nipGuru: mk.nipGuru,
          idKelas: k.idKelas,
          jadwal: "Senin,Rabu",
          waktu: "08:00 - 10:00"
        }
      }));
    }
    if (k.idJurusan === ips.idJurusan) {
      for (const mk of ipsOnly) {
        allMatkul.push(await prisma.mataKuliah.create({
          data: {
            namaMataKuliah: mk.nama,
            nipGuru: mk.nipGuru,
            idKelas: k.idKelas,
            jadwal: "Selasa,Kamis",
            waktu: "10:00 - 12:00"
          }
        }));
      }
    }
  }
  
  // Create some dummy ModulAjar for each Matkul
  for (const mk of allMatkul) {
    await prisma.modulAjar.create({
      data: {
        idMataKuliah: mk.idMataKuliah,
        judul: `Pengantar ${mk.namaMataKuliah}`,
        tipe_modul: "PDF",
        deskripsi: `Materi pengantar untuk ${mk.namaMataKuliah}`,
      }
    });
  }

  console.log("Seeding selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
