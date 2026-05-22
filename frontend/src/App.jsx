import { useState } from "react";
import Login from "./pages/auth/login/login";
import Dashboard from "./pages/siswa/dashboard/dashboard";
import DashboardGuru from "./pages/guru/dashboardGuru/dashboardGuru";
import DaftarMataKuliah from "./pages/siswa/daftarMataKuliah/daftarMataKuliah";
import MataKuliah from "./pages/siswa/mataKuliah/mataKuliah";
import DaftarTugas from "./pages/siswa/daftarTugas/daftarTugas";
import Kuis from "./pages/siswa/kuis/kuis";
import HasilKuis from "./pages/siswa/kuis/hasilKuis";
import PresensiSiswa from "./pages/siswa/presensiSiswa/presensiSiswa";
import ForumDiskusi from "./pages/siswa/forumDiskusi/forumDiskusi";
import Profile from "./pages/siswa/profile/profile";
import Nilai from "./pages/siswa/nilai/nilai";
import PengumpulanTugas from "./pages/siswa/pengumpulanTugas/pengumpulanTugas";

// Guru-specific pages
import GuruPresensi from "./pages/guru/guruPresensi/guruPresensi";
import GuruTugas from "./pages/guru/guruTugas/guruTugas";
import GuruKelompok from "./pages/guru/guruKelompok/guruKelompok";
import GuruNilaiIndividu from "./pages/guru/guruNilaiIndividu/guruNilaiIndividu";
import GuruForum from "./pages/guru/guruForum/guruForum";
import GuruProfile from "./pages/guru/guruProfile/guruProfile";
import GuruMateri from "./pages/guru/guruMateri/guruMateri";
import FAQ from "./pages/faq/faq";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [currentPage, setCurrentPage] = useState({ page: "dashboard" });
  const [showFaq, setShowFaq] = useState(false);

  const handleLogin = (role) => {
    setIsLoggedIn(true);
    setUserRole(role);
    setCurrentPage({ page: role === "Guru" ? "guruDashboard" : "dashboard" });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole("");
    setCurrentPage({ page: "dashboard" });
  };

  const navigateTo = (target) => {
    if (typeof target === "string") {
      setCurrentPage({ page: target });
    } else {
      setCurrentPage(target); // { page: "mataKuliah", id: 1 }
    }
  };

  if (showFaq) {
    return (
      <div>
        <div style={{ padding: "1rem 2rem", background: "#fff", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button onClick={() => setShowFaq(false)} style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "none", border: "none", cursor: "pointer", color: "#7c5800", fontWeight: 600, fontSize: "0.9rem" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>arrow_back</span>
            Kembali
          </button>
        </div>
        <FAQ />
      </div>
    );
  }

  if (isLoggedIn) {
    const sharedProps = {
      onNavigate: navigateTo,
      onLogout: handleLogout,
      ...currentPage,
    };
    const pageName = currentPage.page;

    // ── SISWA pages ──
    if (pageName === "daftarMataKuliah")
      return <DaftarMataKuliah {...sharedProps} />;
    if (pageName === "mataKuliah") return <MataKuliah {...sharedProps} />;
    if (pageName === "daftarTugas") return <DaftarTugas {...sharedProps} />;
    if (pageName === "kuis") return <Kuis {...sharedProps} idKuis={currentPage.idKuis} />;
    if (pageName === "hasilKuis") return <HasilKuis {...sharedProps} idKuis={currentPage.idKuis} />;
    if (pageName === "presensiSiswa")
      return <PresensiSiswa {...sharedProps} />;
    if (pageName === "forumDiskusi") return <ForumDiskusi {...sharedProps} />;
    if (pageName === "profile") return <Profile {...sharedProps} />;
    if (pageName === "nilai") return <Nilai {...sharedProps} />;
    if (pageName === "pengumpulanTugas")
      return <PengumpulanTugas {...sharedProps} taskId={currentPage.taskId} />;

    // ── GURU-specific pages ──
    if (pageName === "guruPresensi") return <GuruPresensi {...sharedProps} />;
    if (pageName === "guruTugas") return <GuruTugas {...sharedProps} />;
    if (pageName === "guruKelompok") return <GuruKelompok {...sharedProps} />;
    if (pageName === "guruNilaiIndividu") return <GuruNilaiIndividu {...sharedProps} />;
    if (pageName === "guruForum") return <GuruForum {...sharedProps} />;
    if (pageName === "guruProfile") return <GuruProfile {...sharedProps} />;
    if (pageName === "guruMateri") return <GuruMateri {...sharedProps} />;
    if (pageName === "faq") return <div><div style={{ padding: "1rem 2rem", background: "#fff", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", gap: "0.75rem" }}><button onClick={() => navigateTo(userRole === "Guru" ? "guruDashboard" : "dashboard")} style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "none", border: "none", cursor: "pointer", color: "#7c5800", fontWeight: 600, fontSize: "0.9rem" }}><span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>arrow_back</span>Kembali</button></div><FAQ /></div>;

    // Default dashboard per role
    if (userRole === "Siswa") {
      return <Dashboard {...sharedProps} />;
    } else if (userRole === "Guru") {
      return <DashboardGuru {...sharedProps} />;
    } else {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
          }}
        >
          <h2>Akses role tidak ditemukan.</h2>
          <button
            onClick={handleLogout}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              backgroundColor: "#4b53bc",
              color: "white",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Kembali ke Login
          </button>
        </div>
      );
    }
  }

  return (
    <div>
      <Login onLogin={handleLogin} onFaq={() => setShowFaq(true)} />
    </div>
  );
}

export default App;
