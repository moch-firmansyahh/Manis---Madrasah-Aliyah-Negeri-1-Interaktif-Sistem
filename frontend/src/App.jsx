import { useState, lazy, Suspense, useEffect } from "react";
import Login from "./pages/auth/login/login";
import LoadingScreen from "./components/LoadingScreen/LoadingScreen";
import { LoadingProvider, useLoading } from "./utils/LoadingContext";
import { setApiLoadingHooks } from "./utils/apiClient";

// Lazy Loaded Pages
const Dashboard = lazy(() => import("./pages/siswa/dashboard/dashboard"));
const DashboardGuru = lazy(() => import("./pages/guru/dashboardGuru/dashboardGuru"));
const DaftarMataKuliah = lazy(() => import("./pages/siswa/daftarMataKuliah/daftarMataKuliah"));
const MataKuliah = lazy(() => import("./pages/siswa/mataKuliah/mataKuliah"));
const DaftarTugas = lazy(() => import("./pages/siswa/daftarTugas/daftarTugas"));
const Kuis = lazy(() => import("./pages/siswa/kuis/kuis"));
const HasilKuis = lazy(() => import("./pages/siswa/kuis/hasilKuis"));
const PresensiSiswa = lazy(() => import("./pages/siswa/presensiSiswa/presensiSiswa"));
const ForumDiskusi = lazy(() => import("./pages/siswa/forumDiskusi/forumDiskusi"));
const Profile = lazy(() => import("./pages/siswa/profile/profile"));
const Nilai = lazy(() => import("./pages/siswa/nilai/nilai"));
const PengumpulanTugas = lazy(() => import("./pages/siswa/pengumpulanTugas/pengumpulanTugas"));

// Guru-specific pages
const GuruPresensi = lazy(() => import("./pages/guru/guruPresensi/guruPresensi"));
const GuruTugas = lazy(() => import("./pages/guru/guruTugas/guruTugas"));
const GuruKelompok = lazy(() => import("./pages/guru/guruKelompok/guruKelompok"));
const GuruNilaiIndividu = lazy(() => import("./pages/guru/guruNilaiIndividu/guruNilaiIndividu"));
const GuruForum = lazy(() => import("./pages/guru/guruForum/guruForum"));
const GuruProfile = lazy(() => import("./pages/guru/guruProfile/guruProfile"));
const GuruMateri = lazy(() => import("./pages/guru/guruMateri/guruMateri"));
const FAQ = lazy(() => import("./pages/faq/faq"));

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [currentPage, setCurrentPage] = useState({ page: "dashboard" });
  const [showFaq, setShowFaq] = useState(false);
  const { isLoading, startLoading, stopLoading } = useLoading();

  // Wire apiClient to loading context
  useEffect(() => {
    setApiLoadingHooks(startLoading, stopLoading);
  }, [startLoading, stopLoading]);

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
      setCurrentPage(target);
    }
  };

  const renderPage = () => {
    if (showFaq) {
      return (
        <div>
          <div style={{ padding: "1rem 2rem", background: "#fff", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button onClick={() => setShowFaq(false)} style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "none", border: "none", cursor: "pointer", color: "#1374B8", fontWeight: 600, fontSize: "0.9rem" }}>
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
      if (pageName === "daftarMataKuliah") return <DaftarMataKuliah {...sharedProps} />;
      if (pageName === "mataKuliah") return <MataKuliah {...sharedProps} />;
      if (pageName === "daftarTugas") return <DaftarTugas {...sharedProps} />;
      if (pageName === "kuis") return <Kuis {...sharedProps} idKuis={currentPage.idKuis} />;
      if (pageName === "hasilKuis") return <HasilKuis {...sharedProps} idKuis={currentPage.idKuis} />;
      if (pageName === "presensiSiswa") return <PresensiSiswa {...sharedProps} />;
      if (pageName === "forumDiskusi") return <ForumDiskusi {...sharedProps} />;
      if (pageName === "profile") return <Profile {...sharedProps} />;
      if (pageName === "nilai") return <Nilai {...sharedProps} />;
      if (pageName === "pengumpulanTugas") return <PengumpulanTugas {...sharedProps} taskId={currentPage.taskId} />;

      // ── GURU-specific pages ──
      if (pageName === "guruPresensi") return <GuruPresensi {...sharedProps} />;
      if (pageName === "guruTugas") return <GuruTugas {...sharedProps} />;
      if (pageName === "guruKelompok") return <GuruKelompok {...sharedProps} />;
      if (pageName === "guruNilaiIndividu") return <GuruNilaiIndividu {...sharedProps} />;
      if (pageName === "guruForum") return <GuruForum {...sharedProps} />;
      if (pageName === "guruProfile") return <GuruProfile {...sharedProps} />;
      if (pageName === "guruMateri") return <GuruMateri {...sharedProps} />;
      if (pageName === "faq") return (
        <div>
          <div style={{ padding: "1rem 2rem", background: "#fff", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button onClick={() => navigateTo(userRole === "Guru" ? "guruDashboard" : "dashboard")} style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "none", border: "none", cursor: "pointer", color: "#1374B8", fontWeight: 600, fontSize: "0.9rem" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>arrow_back</span>
              Kembali
            </button>
          </div>
          <FAQ />
        </div>
      );

      // Default dashboard per role
      if (userRole === "Siswa") {
        return <Dashboard {...sharedProps} />;
      } else if (userRole === "Guru") {
        return <DashboardGuru {...sharedProps} />;
      } else {
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh" }}>
            <h2>Akses role tidak ditemukan.</h2>
            <button
              onClick={handleLogout}
              style={{
                marginTop: "1rem",
                padding: "0.5rem 1rem",
                backgroundColor: "#1374B8",
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
      <Login onLogin={handleLogin} onFaq={() => setShowFaq(true)} />
    );
  };

  return (
    <>
      {/* Overlay loading for API calls */}
      {isLoading && <LoadingScreen overlay />}
      <Suspense fallback={<LoadingScreen />}>
        {renderPage()}
      </Suspense>
    </>
  );
}

function App() {
  return (
    <LoadingProvider>
      <AppContent />
    </LoadingProvider>
  );
}

export default App;
