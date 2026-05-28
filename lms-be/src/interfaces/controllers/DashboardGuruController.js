export class DashboardGuruController {
constructor(dashboardGuruUseCase) {
    this.useCase = dashboardGuruUseCase;
}

  // Menggunakan arrow function untuk menghindari error hilangnya konteks 'this' [cite: 520, 526]
getDashboard = async (req, res) => {
    try {
        const nomorInduk = req.user.nomorInduk;
        const idKelas = req.query.idKelas ? parseInt(req.query.idKelas) : null;
        const dashboardData = await this.useCase.getDashboardData(nomorInduk, idKelas);
        res.status(200).json(dashboardData);
    } catch (error) {
        console.error("Dashboard Guru Error:", error.message);
        res.status(500).json({ error: error.message });
    }
    };
}