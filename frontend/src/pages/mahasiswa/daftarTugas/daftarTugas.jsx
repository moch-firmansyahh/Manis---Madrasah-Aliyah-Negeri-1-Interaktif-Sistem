import React, { useMemo, useState, useEffect } from "react";
import "../../../shared.css";
import "./daftarTugas.css";
import Sidebar from "../../../Sidebar";
import { useSidebar } from "../../../useSidebar";
import Navbar from "../../../Navbar";
import { apiClient } from "../../../utils/apiClient";

const FILTERS = [
  { key: "semua",            label: "Semua" },
  { key: "belum_dikerjakan", label: "Belum Dikerjakan" },
  { key: "sedang_berjalan",  label: "Sedang Berjalan" },
  { key: "terlambat", label: "Terlambat" },
  { key: "selesai",          label: "Selesai" },
];

function getBarColor(status, progress) {
  if (status === "selesai") return "#2f9696";
  if (progress === 0)       return "#cbd5e1";
  return "#c47f17";
}

function formatDeadline(deadlineTugas) {
  if (!deadlineTugas) return { label: "Tanpa deadline", urgent: false };
  const deadline = new Date(deadlineTugas);
  const now = new Date();
  const diffMs = deadline - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) return { label: "Melewati deadline", urgent: true };
  if (diffDays === 0) return { label: "Hari ini", urgent: true };
  if (diffDays === 1) return { label: "Besok", urgent: true };
  return { label: `${diffDays} hari lagi`, urgent: false };
}

export default function DaftarTugas({ onNavigate, onLogout, idMataKuliah }) {
  const { sidebarOpen, openSidebar, closeSidebar } = useSidebar();
  const [activeFilter, setActiveFilter] = useState("semua");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const query = idMataKuliah ? `?idMataKuliah=${idMataKuliah}` : "";
        const response = await apiClient.get(`/api/tugas${query}`);
        const payload = response?.data || [];
        const normalized = payload.map((task) => {
          const deadline = formatDeadline(task.deadlineTugas);
          return {
            id: task.id,
            idMataKuliah: task.idMataKuliah,
            course: task.mataKuliah,
            name: task.judul,
            detailTugas: task.detailTugas,
            deadlineLabel: deadline.label,
            deadlineUrgent: deadline.urgent,
            progress: task.progress ?? 0,
            status: task.status,
            isQuiz: false,
          };
        });
        setTasks(normalized);
      } catch (error) {
        console.error("Gagal memuat daftar tugas", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [idMataKuliah]);

  const filtered = useMemo(() => {
    if (activeFilter === "semua") return tasks;
    return tasks.filter((task) => task.status === activeFilter);
  }, [tasks, activeFilter]);

  if (loading) {
    return (
      <div className="page-shell" style={{ backgroundColor: "var(--color-background)" }}>
        <main className="page-main" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          Memuat daftar tugas...
        </main>
      </div>
    );
  }

  return (
    <div className="page-shell" style={{ backgroundColor: "var(--color-background)" }}>
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
          <div className="dt-filter-tabs">
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

          {/* Task List */}
          <div className="dt-task-list">
            {filtered.length === 0 ? (
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
                      onClick={() =>
                        onNavigate &&
                        onNavigate({
                          page: "pengumpulanTugas",
                          idTugas: task.id,
                          idMataKuliah: task.idMataKuliah,
                          judul: task.name,
                          mataKuliah: task.course,
                          detailTugas: task.detailTugas,
                        })
                      }
                    >
                      {task.status === "selesai" ? "Lihat Pengumpulan" : "Kumpulkan Tugas"}
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
                Ringkasan ini diambil dari status tugas pada database Anda saat ini.
              </p>
              <div className="dt-fokus-stats">
                <div className="dt-fokus-stat dt-fokus-stat--blue">
                  <p className="dt-fokus-num">{tasks.length}</p>
                  <p className="dt-fokus-lbl">TOTAL TUGAS</p>
                </div>
                <div className="dt-fokus-stat dt-fokus-stat--amber">
                  <p className="dt-fokus-num">{tasks.filter((t) => t.status === "selesai").length}</p>
                  <p className="dt-fokus-lbl">TUGAS SELESAI</p>
                </div>
                <div className="dt-fokus-stat dt-fokus-stat--teal">
                  <p className="dt-fokus-num">{tasks.filter((t) => t.status === "terlambat").length}</p>
                  <p className="dt-fokus-lbl">TERLAMBAT</p>
                </div>
              </div>
            </div>

            {/* CTA Dark Card */}
            <div className="dt-cta-card">
              <h3 className="dt-cta-title">Mulai Tugas Baru?</h3>
              <p className="dt-cta-desc">
                Buka detail mata kuliah untuk melihat modul, kuis, dan daftar tugas terbaru dari dosen.
              </p>
              <button
                className="dt-cta-btn"
                onClick={() => onNavigate && onNavigate("daftarMataKuliah")}
              >
                <span className="material-symbols-outlined">menu_book</span>
                Buka Mata Kuliah
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
