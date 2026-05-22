export class KuisUseCase {
constructor(kuisRepository, nilaiRepository) {
    this.kuisRepository = kuisRepository;
    this.nilaiRepository = nilaiRepository;
}

async getQuestions(idKuis) {
    // Ambil soal kuis tanpa menyertakan kunci jawaban untuk keamanan
    const kuis = await this.kuisRepository.getQuestionsById(idKuis);
    if (!kuis) throw new Error("Kuis tidak ditemukan");
    
    return kuis.soal.map(s => ({
        id: s.id,
        question: s.pertanyaan,
        options: [s.opsiA, s.opsiB, s.opsiC, s.opsiD]
    }));
}

async submitAnswers(nomorInduk, idKuis, studentAnswers) {
    // 1. Ambil kunci jawaban asli dari database
    const questions = await this.kuisRepository.getQuestionsById(idKuis);
    let correctCount = 0;

    // 2. Evaluasi jawaban (studentAnswers format: [1, 2, 0, 3] sesuai index opsi)
    questions.soal.forEach((soal, index) => {
        if (studentAnswers[index] === soal.jawabanBenarIndex) {
        correctCount++;
        }
    });

    // 3. Hitung Nilai Akhir (Skala 100)
    const nilaiAkhir = (correctCount / questions.soal.length) * 100;

    // 4. Simpan ke database Nilai
    await this.nilaiRepository.upsertNilaiKuis(nomorInduk, idKuis, nilaiAkhir);

    return {
        score: nilaiAkhir,
        correctCount,
        totalQuestions: questions.soal.length
    };
    }
}