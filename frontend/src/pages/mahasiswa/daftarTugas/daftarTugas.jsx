import React, { useState, useEffect } from "react";
import "../../../shared.css";
import "./daftarTugas.css";
import Sidebar from "../../../Sidebar";
import { useSidebar } from "../../../useSidebar";
import Navbar from "../../../Navbar";
import { apiClient } from "../../../utils/apiClient";

const AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBLlRblArhYvkrSWfEx3UWaIaP5bdg8OpReWzF-sc4sB_2K3sC4IYv7Q4-lWy6VUtGhc5esYpVi12_HYjLZdjx6ILoT60xad1GfsEtHStVQIigk44gnAXnpEAjWrPWVYNa_AKdaDPqXQwdlJDbcccdQ96CZrZ6btx50rBBy3LvfY-eINJ1MtiJWLJpWBAo2nnbaNr3i-_Yn3B_BsVkOxpG3hVSKt38J2-NxnAah9LFYcNLvZARv4lzr86P24cdV4haCMW80Nudw5Lku";

const FILTERS = [
  { key: "semua",            label: "Semua" },
  { key: "belum_dikerjakan", label: "Belum Dikerjakan" },
  { key: "sedang_berjalan",  label: "Sedang Berjalan" },
  { key: "selesai",          label: "Selesai" },
];

function getBarColor(status, progress) {
  if (status === "selesai") return "#2f9696";
  if (progress === 0)       return "#cbd5e1";
  return "#c47f17";
}

function formatDeadlineLabel(deadlineTugas, sudahKumpul) {
  if (!deadlineTugas) return "Tanpa deadline";
  const d = new Date(deadlineTugas);
  const now = new Date();
  const diffMs = d - now;
  const diffH = Math.ceil(diffMs / (1000 * 60 * 60));
  if (sudahKumpul) return "Telah Dikumpulkan";
  if (diffH <= 0) return "Deadline telah lewat";
  if (diffH <= 24) return `${diffH} Jam Lagi`;
  const diffD = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return `${diffD} Hari Lagi`;
}

export default function DaftarTugas({ onNavigate, onLogout }) {
  const { sidebarOpen, openSidebar, closeSidebar } = useSidebar();
  const [activeFilter, setActiveFilter] = useState("semua");
  const [toast, setToast] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const nim = user.nomorInduk || "";

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/tugas');
      const raw = Array.isArray(res) ? res : (res.data || []);
      const enriched = raw.map(t => {
        const deadline = t.deadlineTugas ? new Date(t.deadlineTugas) : null;
        const now = new Date();
        const sudahKumpul = t.sudahKumpul === true;
        let status = "belum_dikerjakan";
        let progress = 0;
        if (sudahKumpul) {
          status = "selesai";
          progress = 100;
        } else if (deadline && deadline < now) {
          status = "sedang_berjalan";
          progress = 50;
        }
          return {
            id: t.id,
            idMataKuliah: t.idMataKuliah,
            course: t.mataKuliah || "Mata Kuliah",
            deadlineLabel: formatDeadlineLabel(t.deadlineTugas, sudahKumpul),
            deadlineUrgent: deadline ? (deadline - now < 24 * 60 * 60 * 1000 && !sudahKumpul) : false,
            name: t.judul,
            progress,
            status,
            action: "lanjutkan",
            isQuiz: false,
          };
      });
      setTasks(enriched);
    } catch (error) {
      console.error(error);
      showToast("Gagal memuat daftar tugas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await apiClient.get('/api/mata-kuliah');
        setCourses(Array.isArray(res) ? res : (res.data || []));
      } catch (err) {
        console.error("Gagal memuat mata kuliah", err);
      }
    };
    fetchCourses();
    fetchTasks();
  }, []);

  const filteredByStatus = activeFilter === "semua"
    ? tasks
    : tasks.filter((t) => t.status === activeFilter);
  
  const filtered = selectedCourse === "all"
    ? filteredByStatus
    : filteredByStatus.filter(t => t.idMataKuliah === parseInt(selectedCourse));

  return (
    <div className="page-shell" style={{ backgroundColor: "var(--color-background)" }}>
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

      {/* ─── Sidebar ─── */}
      <Sidebar
        onNavigate={onNavigate}
        onLogout={onLogout}
        activePage="daftarTugas"
        mobileOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      {/* ─── Main ─── */}
      <main className="page-main" style={{ backgroundColor: "var(--color-background)" }}>
        {/* Navbar */}
        <Navbar role="Mahasiswa" onOpenSidebar={openSidebar} onNavigate={typeof nav !== "undefined" ? nav : (typeof onNavigate !== "undefined" ? onNavigate : undefined)} />

        {/* Page Content */}
        <div className="page-content">
          {/* Page Header */}
          <div className="dt-page-header">
            <h2 className="dt-title">Daftar Tugas</h2>
            <p className="dt-subtitle">Pantau seluruh tenggat waktu dan progres pembelajaran Anda</p>
          </div>

          {/* Filter Tabs */}
          <div className="dt-filter-section" style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", justifyContent: "space-between" }}>
            <div className="dt-filter-tabs" style={{ marginBottom: 0 }}>
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  className={`dt-filter-btn ${activeFilter === f.key ? "dt-filter-btn--active" : ""}`}
                  onClick={() => setActiveFilter(f.key)}
                >
                  {f.label}
                  {f.key !== "semua" && (
                    <span className="dt-filter-count">
                      {tasks.filter((t) => t.status === f.key).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
            
            {/* Course Filter Dropdown */}
            <div className="dt-course-filter" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span className="material-symbols-outlined" style={{ color: "var(--slate-500)", fontSize: "1.2rem" }}>filter_list</span>
              <select 
                className="prf-input" 
                style={{ padding: "0.5rem 1rem", minWidth: "200px" }}
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                <option value="all">Semua Mata Kuliah</option>
                {courses.map(c => (
                  <option key={c.idMataKuliah} value={c.idMataKuliah}>{c.namaMataKuliah}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Task List */}
          <div className="dt-task-list">
            {loading ? (
              <div className="dt-empty">
                <span className="material-symbols-outlined">hourglass_empty</span>
                <p>Memuat tugas...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="dt-empty">
                <span className="material-symbols-outlined">task_alt</span>
                <p>Tidak ada tugas dalam kategori ini.</p>
              </div>
            ) : (
              filtered.map((task) => (
                <div key={task.id} className="dt-task-card">
                  {/* Top row */}
                  <div className="dt-task-top">
                    <div className="dt-task-meta">
                      <span className="dt-course-badge">{task.course}</span>
                      <span className={`dt-deadline ${task.deadlineUrgent ? "dt-deadline--urgent" : task.status === "selesai" ? "dt-deadline--done" : "dt-deadline--normal"}`}>
                        <span className="material-symbols-outlined">
                          {task.status === "selesai" ? "check_circle" : "schedule"}
                        </span>
                        {task.deadlineLabel}
                      </span>
                    </div>
                    {/* Action button */}
                    <button
                      className="dt-btn dt-btn--primary"
                      onClick={() => onNavigate && onNavigate({ page: "pengumpulanTugas", taskId: task.id })}
                    >
                      Lihat Detail
                    </button>
                  </div>

                  {/* Task name */}
                  <h3 className="dt-task-name">{task.name}</h3>

                  {/* Progress bar */}
                  <div className="dt-bar-row">
                    <div className="dt-bar-track">
                      <div
                        className="dt-bar-fill"
                        style={{ width: `${task.progress}%`, backgroundColor: getBarColor(task.status, task.progress) }}
                      ></div>
                    </div>
                    <span className="dt-bar-pct" style={{ color: getBarColor(task.status, task.progress) }}>
                      {task.progress}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Section */}
          <div className="dt-footer-grid">
            {/* Fokus Card */}
            <div className="dt-fokus-card">
              <h3 className="dt-fokus-title">Fokus Pembelajaran Minggu Ini</h3>
              <p className="dt-fokus-desc">
                Anda telah menyelesaikan 60% dari target tugas pekan ini. Tetap semangat, sisa 2 tugas lagi!
              </p>
              <div className="dt-fokus-stats">
                <div className="dt-fokus-stat dt-fokus-stat--blue">
                  <p className="dt-fokus-num">08</p>
                  <p className="dt-fokus-lbl">JAM BELAJAR</p>
                </div>
                <div className="dt-fokus-stat dt-fokus-stat--amber">
                  <p className="dt-fokus-num">12</p>
                  <p className="dt-fokus-lbl">TUGAS SELESAI</p>
                </div>
                <div className="dt-fokus-stat dt-fokus-stat--teal">
                  <p className="dt-fokus-num">85</p>
                  <p className="dt-fokus-lbl">SKOR RATA-RATA</p>
                </div>
              </div>
            </div>

            {/* CTA Dark Card */}
            <div className="dt-cta-card">
              <h3 className="dt-cta-title">Mulai Tugas Baru?</h3>
              <p className="dt-cta-desc">
                Unduh panduan pengerjaan tugas akhir semester untuk persiapan lebih awal.
              </p>
              <button
                className="dt-cta-btn"
                onClick={() => showToast("File panduan sedang diunduh...")}
              >
                <span className="material-symbols-outlined">download</span>
                Unduh Panduan (.PDF)
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
