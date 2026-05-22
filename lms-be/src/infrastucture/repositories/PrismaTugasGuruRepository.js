import { prisma } from '../../prismaClient.js';
export class PrismaTugasGuruRepository {
async findAllByGuru(idMataKuliahList) {
    // Mengambil tugas dan kuis berdasarkan mata kuliah yang diajar guru
    const allTugas = await prisma.tugas.findMany({
        where: { idMataKuliah: { in: idMataKuliahList } },
        include: { mataKuliah: true, pengumpulanTugas: true },
        orderBy: { deadlineTugas: 'asc' }
    });

    // Deduplicate tugas — grup berdasarkan judul + idMataKuliah + deadline
    // Guru seharusnya melihat 1 baris per "tugas", bukan 1 baris per siswa
    const tugasMap = new Map();
    for (const t of allTugas) {
      const key = `${t.judul}__${t.idMataKuliah}__${t.deadlineTugas?.toISOString() || ''}`;
      if (!tugasMap.has(key)) {
        tugasMap.set(key, {
          ...t,
          pengumpulanTugas: [...(t.pengumpulanTugas || [])],
          _totalSiswa: 1,
        });
      } else {
        const existing = tugasMap.get(key);
        existing.pengumpulanTugas.push(...(t.pengumpulanTugas || []));
        existing._totalSiswa += 1;
      }
    }
    const tugas = Array.from(tugasMap.values());
    
    const kuis = await prisma.kuis.findMany({
        where: { idMataKuliah: { in: idMataKuliahList } },
        include: { mataKuliah: true, soal: true }
    });

    const kuisWithCounts = await Promise.all(kuis.map(async (k) => {
        const jumlahPengerjaan = await prisma.jawabanKuis.count({ where: { idKuis: k.idKuis } });
        const totalSiswa = await prisma.nilai.count({ where: { idMataKuliah: k.idMataKuliah } });
        return { ...k, jumlahPengerjaan, totalSiswa };
    }));

    return { tugas, kuis: kuisWithCounts };
    }

async createTugas(data) {
    // Dapatkan semua siswa yang terdaftar di mata kuliah ini dari BERBAGAI SUMBER
    const idMataKuliah = parseInt(data.idMataKuliah);
    const nomorIndukSet = new Set();

    // 1. Cari dari tabel Nilai (siswa yang sudah punya nilai)
    try {
        const nilaiData = await prisma.nilai.findMany({
            where: { idMataKuliah },
            select: { nomorInduk: true }
        });
        nilaiData.forEach(n => nomorIndukSet.add(n.nomorInduk));
    } catch (e) {}

    // 2. Cari dari tabel Presensi (siswa yang pernah presensi)
    try {
        const presensiData = await prisma.presensi.findMany({
            where: { idMataKuliah },
            select: { nis: true }
        });
        const niss = presensiData.map(p => p.nis);
        if (niss.length > 0) {
            const mhs = await prisma.siswa.findMany({
                where: { nis: { in: niss } },
                select: { nomorInduk: true }
            });
            mhs.forEach(m => nomorIndukSet.add(m.nomorInduk));
        }
    } catch (e) {}

    // 3. Cari dari tabel AnggotaKelompok (siswa yang terdaftar di kelompok)
    try {
        const kelompokData = await prisma.kelompok.findMany({
            where: { idMataKuliah },
            include: { anggota: { select: { nis: true } } }
        });
        const niss = kelompokData.flatMap(k => k.anggota.map(a => a.nis));
        if (niss.length > 0) {
            const mhs = await prisma.siswa.findMany({
                where: { nis: { in: niss } },
                select: { nomorInduk: true }
            });
            mhs.forEach(m => nomorIndukSet.add(m.nomorInduk));
        }
    } catch (e) {}

    // 4. Cari dari tabel ProgressMateri (siswa yang akses materi)
    try {
        const modulList = await prisma.modulAjar.findMany({
            where: { idMataKuliah },
            select: { idModulAjar: true }
        });
        const modulIds = modulList.map(m => m.idModulAjar);
        if (modulIds.length > 0) {
            const progressData = await prisma.progressMateri.findMany({
                where: { idModulAjar: { in: modulIds } },
                select: { nis: true }
            });
            const niss = progressData.map(p => p.nis);
            if (niss.length > 0) {
                const mhs = await prisma.siswa.findMany({
                    where: { nis: { in: niss } },
                    select: { nomorInduk: true }
                });
                mhs.forEach(m => nomorIndukSet.add(m.nomorInduk));
            }
        }
    } catch (e) {}

    // Convert nomorInduk ke NIS
    let siswaNISs = [];
    const relatedNomorInduk = Array.from(nomorIndukSet);
    if (relatedNomorInduk.length > 0) {
        const siswas = await prisma.siswa.findMany({
            where: { nomorInduk: { in: relatedNomorInduk } },
            select: { nis: true }
        });
        siswaNISs = siswas.map(m => m.nis);
    }

    // Fallback: jika masih kosong, gunakan semua siswa sebagai default
    if (siswaNISs.length === 0) {
        try {
            const allSiswa = await prisma.siswa.findMany({ select: { nis: true } });
            siswaNISs = allSiswa.map(m => m.nis);
            console.log(`[createTugas] Fallback: menggunakan ${siswaNISs.length} siswa dari database`);
        } catch (e) {}
    }

    if (siswaNISs.length === 0) {
        throw new Error('Tidak ada siswa yang terdaftar di sistem. Pastikan ada data siswa di database.');
    }

    console.log(`[createTugas] Membuat tugas untuk ${siswaNISs.length} siswa di mata kuliah ${idMataKuliah}`);

    // Helper untuk trim string
    const trimString = (str, maxLen) => str && str.length > maxLen ? str.substring(0, maxLen - 3) + '...' : str;

    // Buat satu record Tugas per siswa (dengan file info dari guru)
    const newTugasRecords = await prisma.$transaction(
        siswaNISs.map(nis =>
            prisma.tugas.create({
                data: {
                    idMataKuliah: parseInt(data.idMataKuliah),
                    nis,
                    judul: trimString(data.judul, 200),
                    tipeTugas: data.tipeTugas || data.tipe || 'Individu',
                    detailTugas: data.deskripsi || data.detailTugas || '',
                    deadlineTugas: data.deadlineTugas ? new Date(data.deadlineTugas) : null,
                    // File tugas dari guru (lampiran) - trim ke 255 chars
                    fileTugas: trimString(data.fileTugas, 255),
                    namaFileTugas: trimString(data.namaFileTugas, 255),
                    tipeFileTugas: trimString(data.tipeFileTugas, 50),
                    ukuranFile: trimString(data.ukuranFile, 50)
                }
            })
        )
    );

    // Kirim notifikasi ke semua siswa
    try {
        const mataKuliah = await prisma.mataKuliah.findUnique({
            where: { idMataKuliah: parseInt(data.idMataKuliah) }
        });
        await prisma.notifikasi.createMany({
            data: siswaNISs.map(nis => ({
                nis,
                judul: 'Tugas Baru',
                pesan: `Tugas "${data.judul}" untuk mata kuliah ${mataKuliah?.namaMataKuliah || 'ini'} telah tersedia. Jangan lupa dikerjakan!`,
                tipe: 'tugas',
                idRef: newTugasRecords[0]?.idTugas,
                tipeRef: 'tugas'
            }))
        });
        console.log(`Notifikasi Tugas dikirim ke ${siswaNISs.length} siswa`);
    } catch (e) {
        console.error('Gagal mengirim notifikasi tugas:', e.message);
    }

    return newTugasRecords[0];
}

async createKuis(data, quizData) {
    // Menyimpan Kuis beserta Soal dan Pilihan Jawabannya
    const idMataKuliah = parseInt(data.idMataKuliah);
    const mataKuliah = await prisma.mataKuliah.findUnique({
        where: { idMataKuliah }
    });

    const newKuis = await prisma.kuis.create({
        data: {
            idMataKuliah: data.idMataKuliah,
            judul: data.judul,
            deadlineKuis: new Date(data.deadlineTugas),
            soal: {
                create: quizData.map((q) => ({
                pertanyaan: q.text,
                kunciJawaban: q.options[q.correctIndex],
                pilihanJawaban: {
                    create: q.options.map((opt) => ({
                    teksJawaban: opt
                    }))
                }
                }))
            }
        }
    });

    // Kirim notifikasi ke semua siswa yang terkait (dari berbagai sumber)
    try {
        const nomorIndukSet = new Set();

        // 1. Cari dari tabel Nilai
        try {
            const nilaiData = await prisma.nilai.findMany({
                where: { idMataKuliah },
                select: { nomorInduk: true }
            });
            nilaiData.forEach(n => nomorIndukSet.add(n.nomorInduk));
        } catch (e) {}

        // 2. Cari dari tabel Presensi
        try {
            const presensiData = await prisma.presensi.findMany({
                where: { idMataKuliah },
                select: { nis: true }
            });
            const niss = presensiData.map(p => p.nis);
            if (niss.length > 0) {
                const mhs = await prisma.siswa.findMany({
                    where: { nis: { in: niss } },
                    select: { nomorInduk: true }
                });
                mhs.forEach(m => nomorIndukSet.add(m.nomorInduk));
            }
        } catch (e) {}

        // 3. Cari dari tabel AnggotaKelompok
        try {
            const kelompokData = await prisma.kelompok.findMany({
                where: { idMataKuliah },
                include: { anggota: { select: { nis: true } } }
            });
            const niss = kelompokData.flatMap(k => k.anggota.map(a => a.nis));
            if (niss.length > 0) {
                const mhs = await prisma.siswa.findMany({
                    where: { nis: { in: niss } },
                    select: { nomorInduk: true }
                });
                mhs.forEach(m => nomorIndukSet.add(m.nomorInduk));
            }
        } catch (e) {}

        // Convert ke NIS dan kirim notifikasi
        const relatedNomorInduk = Array.from(nomorIndukSet);
        if (relatedNomorInduk.length > 0) {
            const siswas = await prisma.siswa.findMany({
                where: { nomorInduk: { in: relatedNomorInduk } },
                select: { nis: true }
            });
            const relatedNISs = siswas.map(m => m.nis);
            if (relatedNISs.length > 0) {
                await prisma.notifikasi.createMany({
                    data: relatedNISs.map(nis => ({
                        nis,
                        judul: 'Kuis Baru',
                        pesan: `Kuis "${data.judul}" untuk mata kuliah ${mataKuliah?.namaMataKuliah || 'ini'} telah tersedia. Ayo kerjakan sekarang!`,
                        tipe: 'kuis',
                        idRef: newKuis.idKuis,
                        tipeRef: 'kuis'
                    }))
                });
                console.log(`Notifikasi Kuis dikirim ke ${relatedNISs.length} siswa`);
            }
        } else {
            // Fallback: kirim ke semua siswa
            const allSiswa = await prisma.siswa.findMany({ select: { nis: true } });
            if (allSiswa.length > 0) {
                await prisma.notifikasi.createMany({
                    data: allSiswa.map(m => ({
                        nis: m.nis,
                        judul: 'Kuis Baru',
                        pesan: `Kuis "${data.judul}" untuk mata kuliah ${mataKuliah?.namaMataKuliah || 'ini'} telah tersedia. Ayo kerjakan sekarang!`,
                        tipe: 'kuis',
                        idRef: newKuis.idKuis,
                        tipeRef: 'kuis'
                    }))
                });
                console.log(`Notifikasi Kuis dikirim ke ${allSiswa.length} siswa (fallback)`);
            }
        }
    } catch (e) {
        console.error('Gagal mengirim notifikasi kuis:', e.message);
    }

    return newKuis;
}

async updateTugas(idTugas, data) {
    const trimString = (str, maxLen) => str && str.length > maxLen ? str.substring(0, maxLen - 3) + '...' : str;

    // Cari tugas referensi untuk ambil judul dan idMataKuliah lama
    const ref = await prisma.tugas.findUnique({ where: { idTugas: parseInt(idTugas) } });
    if (!ref) throw new Error('Tugas tidak ditemukan');

    const updateData = {
        judul: trimString(data.judul, 200) || ref.judul,
        tipeTugas: data.tipeTugas || data.tipe || ref.tipeTugas,
        detailTugas: data.deskripsi || data.detailTugas || "",
        deadlineTugas: data.deadlineTugas ? new Date(data.deadlineTugas) : ref.deadlineTugas,
    };

    if (data.fileTugas !== undefined) {
        updateData.fileTugas = trimString(data.fileTugas, 255);
        updateData.namaFileTugas = trimString(data.namaFileTugas, 255);
        updateData.tipeFileTugas = trimString(data.tipeFileTugas, 50);
        updateData.ukuranFile = trimString(data.ukuranFile, 50);
    }

    // Update SEMUA record tugas dengan judul+idMataKuliah yang sama
    await prisma.tugas.updateMany({
        where: { judul: ref.judul, idMataKuliah: ref.idMataKuliah },
        data: updateData
    });

    return await prisma.tugas.findUnique({ where: { idTugas: parseInt(idTugas) } });
}

async deleteTugas(idTugas) {
    const parsedId = parseInt(idTugas);

    // Cari tugas referensi untuk ambil judul dan idMataKuliah
    const ref = await prisma.tugas.findUnique({ where: { idTugas: parsedId } });
    if (!ref) throw new Error('Tugas tidak ditemukan');

    // Ambil semua idTugas dengan judul+idMataKuliah yang sama
    const semuaRecord = await prisma.tugas.findMany({
        where: { judul: ref.judul, idMataKuliah: ref.idMataKuliah },
        select: { idTugas: true }
    });
    const semuaId = semuaRecord.map(r => r.idTugas);

    // Hapus pengumpulan untuk semua record tersebut
    await prisma.pengumpulanTugas.deleteMany({
        where: { idTugas: { in: semuaId } }
    });

    // Hapus semua record tugas
    return await prisma.tugas.deleteMany({
        where: { idTugas: { in: semuaId } }
    });
}
async saveGrades(gradesData) {
    // Menyimpan nilai ke tabel Nilai (create jika belum ada, update jika sudah)
    // gradesData adalah array objek { nomorInduk, idMataKuliah, nilaiTugas }
    return await prisma.$transaction(async (tx) => {
        const results = [];
        for (const grade of gradesData) {
            const idMataKuliah = parseInt(grade.idMataKuliah);
            const nilaiTugas = parseFloat(grade.nilaiTugas);
            if (!grade.nomorInduk || Number.isNaN(idMataKuliah) || Number.isNaN(nilaiTugas)) continue;

            const existing = await tx.nilai.findFirst({
                where: { nomorInduk: grade.nomorInduk, idMataKuliah }
            });
            if (existing) {
                results.push(await tx.nilai.update({
                    where: { idNilai: existing.idNilai },
                    data: { nilaiTugas }
                }));
            } else {
                results.push(await tx.nilai.create({
                    data: { nomorInduk: grade.nomorInduk, idMataKuliah, nilaiTugas }
                }));
            }
        }
        return results;
    });
    }
}