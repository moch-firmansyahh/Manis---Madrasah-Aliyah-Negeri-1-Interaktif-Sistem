export class GetTranskripUsecase {
constructor(nilaiRepository) {
    this.nilaiRepository = nilaiRepository;
}

async execute(nomorInduk) {
    const rawData = await this.nilaiRepository.getNilaiByNomorInduk(nomorInduk);
    
    // Kelompokkan berdasarkan semester dari mata kuliah
    const groupedBySemester = rawData.reduce((acc, curr) => {
      const semester = curr.mataKuliah?.semester || curr.semester || 1;
      if (!acc[semester]) acc[semester] = [];
      acc[semester].push(curr);
      return acc;
    }, {});

    // Urutkan keys semester
    const sortedResult = {};
    Object.keys(groupedBySemester).sort((a, b) => a - b).forEach(key => {
      sortedResult[key] = groupedBySemester[key];
    });
    
    return sortedResult;
    }
}