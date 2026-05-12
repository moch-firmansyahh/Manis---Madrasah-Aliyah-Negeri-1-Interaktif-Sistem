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
  const [toast, setToast] = useState(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pdf: 0, video: 0, tugas: 0, kuis: 0 });

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        // Fetch course detail
        const courseRes = await apiClient.get(`/api/mata-kuliah/${idMataKuliah}`);
        const courseData = courseRes.data || courseRes;
        setCourse(courseData);

        // Fetch modul ajar — backend returns mapped fields: id, judul, tipe, matkul, url, deskripsi
        const modulRes = await apiClient.get('/api/modul-ajar');
        const allModuls = Array.isArray(modulRes) ? modulRes : (modulRes.data || []);
        // Filter berdasarkan idMataKuliah (backend field: matkul)
        const courseModules = allModuls.filter(m => 
          m.matkul === idMataKuliah || m.idMataKuliah === idMataKuliah || m.matkul === parseInt(idMataKuliah)
        );
        
        const formattedModules = courseModules.map((m, index) => ({
          id: m.id || m.idModulAjar || index + 1,
          title: m.judul || "Materi Tanpa Judul",
          meta: (m.tipe || m.tipe_modul) === "Video" ? "Video Pembelajaran" : "Dokumen PDF",
          type: (m.tipe || m.tipe_modul)?.toLowerCase() === "video" ? "video" : "pdf",
          action: (m.tipe || m.tipe_modul)?.toLowerCase() === "video" ? "play" : "download",
          status: "active",
          url: m.url || m.fileUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          deskripsi: m.deskripsi || "Tidak ada deskripsi untuk modul ini."
        }));

        setModules(formattedModules.length > 0 ? formattedModules : [
          { id: 1, title: "Belum ada materi", meta: "-", type: "pdf", action: "none", status: "", deskripsi: "Dosen belum mengunggah materi." }
        ]);
        if (formattedModules.length > 0) setActiveModule(formattedModules[0].id);

        // Hitung stats PDF dan Video
        const pdfCount = formattedModules.filter(m => m.type === "pdf").length;
        const videoCount = formattedModules.filter(m => m.type === "video").length;

        // Fetch tugas count
        let tugasCount = 0;
        try {
          const tugasRes = await apiClient.get(`/api/tugas?idMataKuliah=${idMataKuliah}`);
          const tugasData = Array.isArray(tugasRes) ? tugasRes : (tugasRes.data || []);
          tugasCount = tugasData.length;
        } catch(e) { /* ignore */ }

        // Fetch kuis count
        let kuisCount = 0;
        try {
          const kuisRes = await apiClient.get(`/api/kuis/mata-kuliah/${idMataKuliah}`);
          const kuisData = Array.isArray(kuisRes) ? kuisRes : (kuisRes.data || []);
          kuisCount = kuisData.length;
        } catch(e) { /* ignore */ }

        setStats({ pdf: pdfCount, video: videoCount, tugas: tugasCount, kuis: kuisCount });

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
              <h3>{modules.find(m => m.id === activeModule)?.title || "Video Pembelajaran"}</h3>
              <p>{modules.find(m => m.id === activeModule)?.meta || "Materi Video"}</p>
            </div>
            <div className="mk-video-player-wrapper">
              <video
                className="mk-video-player"
                controls
                autoPlay
                src={modules.find(m => m.id === activeModule)?.url || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}
                poster="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop"
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
              {/* Video Player or Thumbnail */}
              {(() => {
                const activeData = modules.find(m => m.id === activeModule) || modules[0];
                return (
                  <>
                    <div className="mk-video-card">
                      <div className="mk-video-thumb">
                        <img
                          src={activeData?.type === "video" ? "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop" : "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&auto=format&fit=crop"}
                          alt={activeData?.title}
                        />
                        <div className="mk-video-overlay" onClick={() => {
                          if (activeData?.action === "play") setVideoOpen(true);
                          else if (activeData?.action === "download") window.open(`http://localhost:3000${activeData.url}`, '_blank');
                        }} style={{ cursor: "pointer" }}>
                          <button className="mk-play-btn">
                            <span className="material-symbols-outlined">{activeData?.action === "play" ? "play_arrow" : "download"}</span>
                          </button>
                          <span className="mk-video-lbl">{activeData?.action === "play" ? "Putar Video" : "Unduh Materi"}</span>
                        </div>
                        <div className="mk-video-info">
                          <p className="mk-video-title">{activeData?.title}</p>
                          <p className="mk-video-meta">{activeData?.meta}</p>
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
                        {activeData?.deskripsi}
                      </p>
                      <div className="mk-stats-row">
                        {[[String(stats.pdf).padStart(2,'0'),"Modul PDF","mataKuliah"],[String(stats.video).padStart(2,'0'),"Video Ajar","mataKuliah"],[String(stats.tugas).padStart(2,'0'),"Tugas","daftarTugas"],[String(stats.kuis).padStart(2,'0'),"Kuis","kuis"]].map(([n,l,page]) => (
                          <div key={l} className="mk-stat-chip" style={{ cursor: "pointer" }} onClick={() => onNavigate && onNavigate(page)}>
                            <p className="mk-stat-num">{n}</p>
                            <p className="mk-stat-lbl">{l}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                );
              })()}
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
                          if (m.type === "video") {
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
                          {m.action === "download" && (
                            <button className="mk-dl-btn" onClick={() => showToast(`Mengunduh: ${m.title}`)}>
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
                  <div className="mk-inst-avatar" style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #2f9696, #4b53bc)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>
                    {(course?.dosen?.user?.nama || course?.dosenNama || "??").split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <div className="mk-inst-info">
                    <p className="mk-inst-name">{course?.dosen?.user?.nama || course?.dosenNama || "Dosen"}</p>
                    <p className="mk-inst-role">Dosen {course?.namaMataKuliah || course?.nama || ""}</p>
                  </div>
                  <button className="mk-contact-btn" onClick={() => showToast(`Email ke: ${course?.dosen?.user?.email || "dosen@kampus.ac.id"}`)} title="Hubungi Dosen">
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



