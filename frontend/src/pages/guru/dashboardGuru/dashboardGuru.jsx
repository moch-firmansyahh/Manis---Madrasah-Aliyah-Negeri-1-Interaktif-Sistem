import React, { useState, useEffect } from "react";
import "../../../components/shared.css";
import "./dashboardGuru.css";
import SidebarGuru from "../../../components/SidebarGuru";
import { useSidebar } from "../../../components/useSidebar";
import Navbar from "../../../components/Navbar";
import { apiClient, API_URL } from "../../../utils/apiClient";

const AVATAR_GURU =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBjoXu55KCdSSPl-2t0t7d2EH6gux6Xz8nZaCdXHePrj-gGn1ZWZyBoOucWc2yVgrhmNFyy8cKbxWH8i9Wm5VKkpqX9jraXjkHTr8PVU1oN3V4nkzLWUUm6nyAIS3hGDic_uY0YoNLNNZluKTKqFwJb2gYlRl9eATGdlXClTx6IXpYvk-2u1qqvfUGTzs-QJPlXTouWTyNYzTe8j8mS09evVA_aHTYfHxneVwUsb2jUygYzuAIDU5KwqO2kISzLvnzaTentePscoGoo";

const API_BASE = API_URL;

export default function DashboardGuru({ onNavigate, onLogout }) {
  const { sidebarOpen, openSidebar, closeSidebar } = useSidebar();
  const [toast, setToast] = useState(null);
  const [selectedMateri, setSelectedMateri] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(AVATAR_GURU);

  const [dashboardData, setDashboardData] = useState({
    lecturerName: "Guru",
    stats: {
      totalSiswa: 0,
      tugasIndividu: 0,
      tugasKelompok: 0,
    },
    daftarMateri: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        if (storedUser.fotoUrl) {
          setAvatarUrl(`${API_BASE}${storedUser.fotoUrl}`);
        }
        const res = await apiClient.get("/api/guru/dashboard");
        if (res && res.data) {
          setDashboardData(res.data);
        } else if (res) {
          setDashboardData(res);
        }
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const nav = (page) => onNavigate && onNavigate(page);

  return (
    <div className="page-shell">
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: "5rem",
            right: "1.5rem",
            zIndex: 999,
            background: toast.type === "error" ? "#fff1f2" : "#ecfdf5",
            color: toast.type === "error" ? "#dc2626" : "#059669",
            border:
              toast.type === "error"
                ? "1px solid #fecaca"
                : "1px solid #a7f3d0",
            padding: "0.75rem 1.25rem",
            borderRadius: "0.75rem",
            fontWeight: 600,
            fontSize: "0.875rem",
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "1.1rem" }}
          >
            {toast.type === "error" ? "error" : "check_circle"}
          </span>
          {toast.msg}
        </div>
      )}

      {/* ─── Sidebar ─── */}
      <SidebarGuru
        onNavigate={onNavigate}
        onLogout={onLogout}
        activePage="guruDashboard"
        mobileOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      {/* ─── Main ─── */}
      <main className="page-main">
        {/* Navbar */}
        <Navbar
          role="Guru"
          onOpenSidebar={openSidebar}
          onNavigate={
            typeof nav !== "undefined"
              ? nav
              : typeof onNavigate !== "undefined"
                ? onNavigate
                : undefined
          }
        />

        {/* Content */}
        <div className="page-content">
          {/* Page Header */}
          <div className="dd-page-header">
            <div>
              <h2 className="dd-title">Dashbord Guru</h2>
              <p className="dd-subtitle">
                Selamat pagi, Pak / Bu {dashboardData.lecturerName}. Berikut
                ringkasan kurasi akademik Anda hari ini.
              </p>
            </div>
            <div className="dd-action-row">
              <button
                className="dd-btn dd-btn--blue"
                onClick={() => nav("guruTugas")}
              >
                <span className="material-symbols-outlined">add_task</span>+
                Kelola Tugas
              </button>
              <button
                className="dd-btn dd-btn--dark"
                onClick={() => nav("guruMateri")}
              >
                <span className="material-symbols-outlined">post_add</span>+
                Tambah Materi
              </button>
              <button
                className="dd-btn dd-btn--amber"
                onClick={() => nav("guruPresensi")}
              >
                <span className="material-symbols-outlined">qr_code_2</span>
                Hasilkan QR Presensi
              </button>
            </div>
          </div>

          {/* Stats Grid - 3 Card Utama */}
          <div
            className="dd-stats-grid"
            style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
          >
            <div className="dd-stat-card">
              <div className="dd-stat-top">
                <div className="dd-stat-icon dd-icon--blue">
                  <span className="material-symbols-outlined">group</span>
                </div>
                <span className="dd-badge dd-badge--green">Aktif</span>
              </div>
              <p className="dd-stat-label">Total Siswa Aktif</p>
              <p className="dd-stat-value">{dashboardData.stats.totalSiswa}</p>
            </div>

            <div className="dd-stat-card">
              <div className="dd-stat-top">
                <div className="dd-stat-icon dd-icon--orange">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <span className="dd-badge dd-badge--blue">Total</span>
              </div>
              <p className="dd-stat-label">Pengumpulan Tugas Individu</p>
              <p className="dd-stat-value">
                {dashboardData.stats.tugasIndividu}
              </p>
            </div>

            <div className="dd-stat-card">
              <div className="dd-stat-top">
                <div className="dd-stat-icon dd-icon--purple">
                  <span className="material-symbols-outlined">groups</span>
                </div>
                <span className="dd-badge dd-badge--purple">Total</span>
              </div>
              <p className="dd-stat-label">Pengumpulan Tugas Kelompok</p>
              <p className="dd-stat-value">
                {dashboardData.stats.tugasKelompok}
              </p>
            </div>
          </div>

          {/* Daftar Materi */}
          <div className="dd-table-card" style={{ marginTop: "2rem" }}>
            <div className="dd-table-head-row">
              <div>
                <h3 className="dd-table-title">Daftar Materi</h3>
                <p className="dd-table-sub">Materi yang tersedia untuk siswa</p>
              </div>
              <button
                className="dd-table-link"
                onClick={() => nav("guruMateri")}
              >
                Kelola Materi →
              </button>
            </div>
            <div className="dd-table-wrapper">
              <table className="dd-table">
                <thead>
                  <tr>
                    <th>Judul Materi</th>
                    <th>Mata Pelajaran</th>
                    <th>Tipe</th>
                    <th>Tanggal Upload</th>
                    <th>Ukuran</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.daftarMateri.length > 0 ? (
                    dashboardData.daftarMateri.map((materi, i) => (
                      <tr key={materi.id || i}>
                        <td>
                          <div className="dd-student-cell">
                            <div className="dd-avatar av-blue">
                              <span
                                className="material-symbols-outlined"
                                style={{ fontSize: "1rem" }}
                              >
                                {materi.tipe?.toLowerCase().includes("video")
                                  ? "play_circle"
                                  : materi.tipe?.toLowerCase().includes("pdf")
                                    ? "picture_as_pdf"
                                    : "description"}
                              </span>
                            </div>
                            <div>
                              <p className="dd-cell-name">{materi.judul}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <p className="dd-cell-name">{materi.mataKuliah}</p>
                        </td>
                        <td>
                          <span className="dd-status-badge">{materi.tipe}</span>
                        </td>
                        <td>
                          <p className="dd-cell-name">{materi.tanggal}</p>
                        </td>
                        <td>
                          <p className="dd-cell-sub">{materi.ukuran}</p>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        style={{ textAlign: "center", padding: "2rem" }}
                      >
                        Belum ada materi yang diupload.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
