export class DashboardController {
constructor(dashboardSiswaUseCase) {
    this.dashboardSiswaUseCase = dashboardSiswaUseCase;
}

async getSiswaDashboard(req, res) {
    try {
        const nomorInduk = req.user.nomorInduk;
        const hariDariClient = req.query.hari || null;
        const data = await this.dashboardSiswaUseCase.getDashboardData(nomorInduk, hariDariClient);
        res.status(200).json({ status: 'success', data });
    } catch (error) {
        console.error('DashboardController error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
    }
}