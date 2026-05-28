import { useState, useEffect, lazy, Suspense } from "react";
import Login from "./pages/auth/login/login";
import LoadingScreen from "./components/LoadingScreen/LoadingScreen";
import { GuruClassProvider } from "./contexts/GuruClassContext";
import "./App.css";

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

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (sessionStorage.getItem("isF5") === "true") return false;
    return !!localStorage.getItem("token");
  });
  const [userRole, setUserRole] = useState(() => {
    if (sessionStorage.getItem("isF5") === "true") return "";
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase() : "";
      } catch { /* ignore */ }
    }
    return "";
  });
  const [currentPage, setCurrentPage] = useState(() => {
    if (sessionStorage.getItem("isF5") === "true") return { page: "dashboard" };
    const savedPage = sessionStorage.getItem("currentPage");
    if (savedPage) {
      try { return JSON.parse(savedPage); } catch { /* ignore */ }
    }
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const role = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase() : "";
        return { page: role === "Guru" ? "guruDashboard" : "dashboard" };
      } catch { /* ignore */ }
    }
    return { page: "dashboard" };
  });
  const [showFaq, setShowFaq] = useState(false);
  const [pageKey, setPageKey] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Deteksi F5 atau Ctrl+R
      if (e.key === "F5" || (e.ctrlKey && (e.key === "r" || e.key === "R"))) {
        sessionStorage.setItem("isF5", "true");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem("isF5") === "true") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("isF5");
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      sessionStorage.setItem("currentPage", JSON.stringify(currentPage));
    } else {
      sessionStorage.removeItem("currentPage");
    }
  }, [currentPage, isLoggedIn]);

  const handleLogin = (role) => {
    setIsLoggedIn(true);
    setUserRole(role);
    setCurrentPage({ page: role === "Guru" ? "guruDashboard" : "dashboard" });
    setPageKey((k) => k + 1);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("currentPage");
    setIsLoggedIn(false);
    setUserRole("");
    setCurrentPage({ page: "dashboard" });
    setPageKey((k) => k + 1);
  };

  const navigateTo = (target) => {
    if (typeof target === "string") {
      setCurrentPage({ page: target });
    } else {
      setCurrentPage(target);
    }
    setPageKey((k) => k + 1);
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

      if (pageName.startsWith("guru")) {
        let page;
        if (pageName === "guruPresensi") page = <GuruPresensi {...sharedProps} />;
        else if (pageName === "guruTugas") page = <GuruTugas {...sharedProps} />;
        else if (pageName === "guruKelompok") page = <GuruKelompok {...sharedProps} />;
        else if (pageName === "guruNilaiIndividu") page = <GuruNilaiIndividu {...sharedProps} />;
        else if (pageName === "guruForum") page = <GuruForum {...sharedProps} />;
        else if (pageName === "guruProfile") page = <GuruProfile {...sharedProps} />;
        else if (pageName === "guruMateri") page = <GuruMateri {...sharedProps} />;
        else if (pageName === "guruDashboard") page = <DashboardGuru {...sharedProps} />;
        if (page) return page;
      }
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

      if (userRole === "Siswa") {
        return <Dashboard {...sharedProps} />;
      } else if (userRole === "Guru") {
        return <DashboardGuru {...sharedProps} />;
      } else {
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh" }}>
            <h2>Akses role tidak ditemukan.</h2>
            <button onClick={handleLogout} style={{ marginTop: "1rem", padding: "0.5rem 1rem", backgroundColor: "#1374B8", color: "white", borderRadius: "8px", border: "none", cursor: "pointer" }}>
              Kembali ke Login
            </button>
          </div>
        );
      }
    }

    return <Login onLogin={handleLogin} onFaq={() => setShowFaq(true)} />;
  };

  return (
    <Suspense fallback={<LoadingScreen />}>
      <GuruClassProvider>
        <div className="page-fade-in" key={pageKey}>
          {renderPage()}
        </div>
      </GuruClassProvider>
    </Suspense>
  );
}

export default App;
