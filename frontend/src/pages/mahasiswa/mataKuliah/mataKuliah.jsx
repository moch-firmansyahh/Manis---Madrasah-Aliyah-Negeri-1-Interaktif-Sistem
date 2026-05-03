import React, { useState, useEffect } from "react";
import "../../../shared.css";
import "./mataKuliah.css";
import "./videoMataKuliah.css";
import Sidebar from "../../../Sidebar";
import { useSidebar } from "../../../useSidebar";
import Navbar from "../../../Navbar";
import { apiClient } from "../../../utils/apiClient";

export default function MataKuliah({ onNavigate, onLogout, idMataKuliah = 1 }) {
  const { sidebarOpen, openSidebar, closeSidebar } = useSidebar();
  const [activeModule, setActiveModule] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [toast, setToast] = useState(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [stats, setStats] = useState({ modulPdf: 0, videoAjar: 0, tugas: 0, kuis: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const detailRes = await apiClient.get(`/api/mata-kuliah/${idMataKuliah}/detail`);
        const payload = detailRes?.data || detailRes;
        setCourse(payload);
        setStats(payload?.statistik || { modulPdf: 0, videoAjar: 0, tugas: 0, kuis: 0 });

        const formattedModules = (payload?.modulAjar || []).map((m, index) => {
          const tipe = (m.tipe_modul || "").toLowerCase();
          const fileUrl = (m.fileUrl || "").toLowerCase();
          const url = m.fileUrl || m.url || "";
          const isVideo = tipe.includes("video") || fileUrl.endsWith(".mp4") || fileUrl.endsWith(".mov") || fileUrl.endsWith(".webm");
          return {
            id: m.idModulAjar || index + 1,
            title: m.judul || `Modul ${index + 1}`,
            meta: isVideo ? "Video Ajar" : "Modul PDF",
            type: isVideo ? "video" : "pdf",
            action: isVideo ? "play" : "download",
            status: "active",
            url,
            deskripsi: m.deskripsi || "Deskripsi materi tidak tersedia.",
            tanggal: m.tanggal,
          };
        });

        setModules(formattedModules.length > 0 ? formattedModules : [
          { id: 1, title: "Belum ada materi", meta: "-", type: "pdf", action: "none", status: "" }
        ]);
        if (formattedModules.length > 0) {
          setActiveModule(formattedModules[0].id);
          const firstVideo = formattedModules.find((m) => m.type === "video");
          setActiveVideo(firstVideo || null);
        }

      } catch (error) {
        console.error("Gagal memuat mata kuliah", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [idMataKuliah]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  if (loading) {
    return <div className="page-shell"><main className="page-main"><div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh'}}>Memuat materi...</div></main></div>;
  }



  return (
    <div className="page-shell">
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: "5rem", right: "1.5rem", zIndex: 999,
          background: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0",
          padding: "0.75rem 1.25rem", borderRadius: "0.75rem", fontWeight: 600,
          fontSize: "0.875rem", boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          display: "flex", alignItems: "center", gap: "0.5rem"
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>check_circle</span>
          {toast}
        </div>
      )}

      {/* Video Modal */}
      {videoOpen && (
        <div className="mk-video-modal" onClick={() => setVideoOpen(false)}>
          <div className="mk-video-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="mk-video-modal-close" onClick={() => setVideoOpen(false)}>
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="mk-video-modal-header">
              <h3>{activeVideo?.title || "Video Ajar"}</h3>
              <p>Sumber materi dari database</p>
            </div>
            <div className="mk-video-player-wrapper">
              <video
                className="mk-video-player"
                controls
                autoPlay
                src={activeVideo?.url}
              >
                Browser Anda tidak mendukung tag video.
              </video>
            </div>
          </div>
        </div>
      )}

      {/* ─── Sidebar ─── */}
      <Sidebar onNavigate={onNavigate} onLogout={onLogout} activePage="mataKuliah" mobileOpen={sidebarOpen} onClose={closeSidebar} />

      {/* ─── Main ─── */}
      <main className="page-main">
        {/* Navbar */}
        <Navbar role="Mahasiswa" onOpenSidebar={openSidebar} onNavigate={typeof nav !== "undefined" ? nav : (typeof onNavigate !== "undefined" ? onNavigate : undefined)} />

        {/* Content */}
        <div className="page-content">
          {/* Course header */}
          <div className="mk-course-header">
            <span className="mk-faculty-badge">
              <span className="material-symbols-outlined">school</span>
              FAKULTAS INFORMATIKA
            </span>
            <h2 className="mk-course-title">Mata Kuliah: {course?.namaMataKuliah || course?.nama || "Mata Kuliah"}</h2>
            <p className="mk-course-desc">
              Silakan pelajari materi dan kerjakan tugas yang tersedia.
            </p>
          </div>

          {/* Body grid */}
          <div className="mk-body-grid">
            {/* Left */}
            <div className="mk-left-col">
              {/* Video Player */}
              <div className="mk-video-card">
                <div className="mk-video-thumb">
                  <img
                    src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop"
                    alt="Video Ajar"
                  />
                  <div className="mk-video-overlay" onClick={() => setVideoOpen(true)} style={{ cursor: "pointer" }}>
                    <button className="mk-play-btn">
                      <span className="material-symbols-outlined">play_arrow</span>
                    </button>
                    <span className="mk-video-lbl">Putar Video</span>
                  </div>
                  <div className="mk-video-info">
                    <p className="mk-video-title">{activeVideo?.title || "Belum ada video ajar"}</p>
                    <p className="mk-video-meta">{activeVideo?.meta || "Tambahkan modul video di backend"}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mk-desc-card">
                <h3 className="mk-desc-heading">
                  <span className="material-symbols-outlined">info</span>
                  Deskripsi Materi
                </h3>
                <p className="mk-desc-body">
                  Data materi, statistik, dan daftar aktivitas pada halaman ini diambil langsung dari database LMS.
                </p>
                <div className="mk-stats-row">
                  {[
                    [String(stats.modulPdf), "Modul PDF", null],
                    [String(stats.videoAjar), "Video Ajar", null],
                    [String(stats.tugas), "Tugas", { page: "daftarTugas", idMataKuliah }],
                    [String(stats.kuis), "Kuis", course?.kuis?.[0]?.idKuis ? { page: "kuis", idKuis: course.kuis[0].idKuis } : null],
                  ].map(([n, l, page]) => (
                    <div
                      key={l}
                      className="mk-stat-chip"
                      style={{ cursor: page ? "pointer" : "default" }}
                      onClick={() => {
                        if (!page || !onNavigate) return;
                        onNavigate(page);
                      }}
                    >
                      <p className="mk-stat-num">{n}</p>
                      <p className="mk-stat-lbl">{l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="mk-right-col">
              {/* Module List */}
              <div className="mk-module-card">
                <div className="mk-module-header">
                  <h3>Daftar Materi</h3>
                  <span className="mk-prog-badge">{modules.length} MODUL</span>
                </div>
                <div className="mk-module-list">
                  {modules.map((m) => {
                    const isActive = m.id === activeModule;
                    return (
                      <div
                        key={m.id}
                        className={`mk-mod-item ${isActive ? "mk-mod-active" : ""}`}
                        onClick={() => {
                          setActiveModule(m.id);
                          if (m.type === "video" && m.url) {
                            setActiveVideo(m);
                            setVideoOpen(true);
                          }
                        }}
                      >
                        <div className={`mk-mod-icon ${m.type === "video" ? "mk-icon-video" : "mk-icon-pdf"} ${isActive ? "mk-icon-on" : ""}`}>
                          <span className="material-symbols-outlined">
                            {m.type === "video" ? "play_circle" : "picture_as_pdf"}
                          </span>
                        </div>
                        <div className="mk-mod-info">
                          <p className={`mk-mod-title ${isActive ? "mk-mod-title--active" : ""}`}>{m.title}</p>
                          <p className={`mk-mod-meta  ${isActive ? "mk-mod-meta--active"  : ""}`}>{m.meta}</p>
                          {isActive && <div className="mk-bar-track"><div className="mk-bar-fill"></div></div>}
                          {m.action === "download" && m.url && (
                            <button
                              className="mk-dl-btn"
                              onClick={() => {
                                window.open(m.url, "_blank", "noopener,noreferrer");
                                showToast(`Membuka modul: ${m.title}`);
                              }}
                            >
                              <span className="material-symbols-outlined">download</span>
                              Unduh Modul
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Instructor */}
              <div className="mk-instructor-card">
                <p className="mk-inst-label">PENGAJAR</p>
                <div className="mk-inst-row">
                  <img className="mk-inst-avatar" src="https://i.pravatar.cc/80?img=47" alt="Dr. Sarah Wijaya" />
                  <div className="mk-inst-info">
                    <p className="mk-inst-name">Dr. Sarah Wijaya</p>
                    <p className="mk-inst-role">Dosen Basis Data</p>
                  </div>
                  <button className="mk-contact-btn" onClick={() => showToast("Email ke: drsarahwijaya@univ.ac.id")} title="Hubungi Dosen">
                    <span className="material-symbols-outlined">mail</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}



