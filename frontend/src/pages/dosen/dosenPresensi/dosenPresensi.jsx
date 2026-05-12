import React, { useState, useEffect, useCallback } from "react";
import "../../../shared.css";
import "./dosenPresensi.css";
import SidebarDosen from "../../../SidebarDosen";
import { useSidebar } from "../../../useSidebar";
import Navbar from "../../../Navbar";
import { apiClient } from "../../../utils/apiClient";

const AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBjoXu55KCdSSPl-2t0t7d2EH6gux6Xz8nZaCdXHePrj-gGn1ZWZyBoOucWc2yVgrhmNFyy8cKbxWH8i9Wm5VKkpqX9jraXjkHTr8PVU1oN3V4nkzLWUUm6nyAIS3hGDic_uY0YoNLNNZluKTKqFwJb2gYlRl9eATGdlXClTx6IXpYvk-2u1qqvfUGTzs-QJPlXTouWTyNYzTe8j8mS09evVA_aHTYfHxneVwUsb2jUygYzuAIDU5KwqO2kISzLvnzaTentePscoGoo";

const QR_TTL = 15 * 60;

const INITIAL_STUDENTS = [];

const STATUS_OPTS = ["Hadir", "Sakit", "Izin", "Alpa"];

function statusColor(s) {
  return ({ Hadir: "#2f9696", Sakit: "#4b53bc", Izin: "#c47f17", Alpa: "#dc2626" }[s] ?? "#64748b");
}
function generateToken() {
  return `LeMaS-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}
function qrUrl(token) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=10&data=${encodeURIComponent(token)}`;
}
function fmtTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export default function DosenPresensi({ onNavigate, onLogout }) {
  const { sidebarOpen, openSidebar, closeSidebar } = useSidebar();
  const [toast, setToast]     = useState(null);
  const [token, setToken]     = useState(generateToken);
  const [timeLeft, setTimeLeft] = useState(QR_TTL);
  const [qrLoaded, setQrLoaded] = useState(false);
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [mataKuliahList, setMataKuliahList] = useState([]);
  const [selectedMatkul, setSelectedMatkul] = useState({ id: null, name: "Memuat...", room: "-", time: "-", jadwal: "" });
  const [sessionActive, setSessionActive]   = useState(true);
  const [showMatkul, setShowMatkul]         = useState(false);
  const [showJadwal, setShowJadwal]         = useState(false);
  const [selectedDays, setSelectedDays]     = useState([]);
  const [selectedDateFilter, setSelectedDateFilter] = useState("semua");
  const [tempDate, setTempDate]             = useState("");
  const [availableDates, setAvailableDates] = useState([]);
  const [page, setPage] = useState(1);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchStudents = useCallback(async () => {
    if (!selectedMatkul?.id) return;
    try {
      // Add cache-busting query param
      const res = await apiClient.get(`/api/dosen/presensi/matkul/${selectedMatkul.id}/daftar-hadir?_t=${Date.now()}`);
      const data = res.data || res || [];
      const allStudents = Array.isArray(data) ? data : [];
      setStudents(allStudents);
      
      // Extract unique dates for filter - handle both string and Date formats
      const dates = [...new Set(allStudents.map(s => {
        if (!s.tanggalPertemuan) return null;
        // Fix timezone issue by matching local date string if possible
        if (typeof s.tanggalPertemuan === 'string' && s.tanggalPertemuan.includes('T')) {
           return s.tanggalPertemuan.split('T')[0];
        }
        const d = new Date(s.tanggalPertemuan);
        return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
      }))].filter(Boolean).sort().reverse();
      setAvailableDates(dates);
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudents([]);
      setAvailableDates([]);
    }
  }, [selectedMatkul?.id]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await apiClient.get('/api/mata-kuliah');
        const data = Array.isArray(res) ? res : (res.data || []);
        const formatted = data.map(c => ({
          id: c.idMataKuliah,
          name: c.namaMataKuliah,
          room: c.ruang || "Ruang Kelas",
          time: c.jadwal || "08:00 - 10:30",
          jadwal: c.jadwal || ""
        }));
        setMataKuliahList(formatted);
        if (formatted.length > 0 && !selectedMatkul?.id) {
          setSelectedMatkul(formatted[0]);
          setSelectedDays(formatted[0].jadwal ? formatted[0].jadwal.split(',') : []);
        }
      } catch (error) {
        console.error("Failed to load courses");
      }
    };
    fetchCourses();
  }, []);

  // Update selectedDays when selectedMatkul changes
  useEffect(() => {
    if (selectedMatkul?.jadwal) {
      setSelectedDays(selectedMatkul.jadwal.split(','));
    } else {
      setSelectedDays([]);
    }
  }, [selectedMatkul?.id]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showJadwal && !e.target.closest('.dp-jadwal-popup') && !e.target.closest('.dp-btn-outline')) {
        setShowJadwal(false);
      }
      if (showMatkul && !e.target.closest('.dp-matkul-selector') && !e.target.closest('.dp-matkul-dropdown')) {
        setShowMatkul(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showJadwal, showMatkul]);

  useEffect(() => {
    if (selectedMatkul?.id) {
      fetchStudents();
    }
  }, [selectedMatkul?.id, fetchStudents]);

  // Auto-refresh daftar hadir setiap 1 detik saat sesi aktif
  useEffect(() => {
    if (!selectedMatkul?.id) return;
    const interval = setInterval(() => {
      fetchStudents();
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedMatkul?.id]);

  useEffect(() => {
    if (!sessionActive || timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft, sessionActive]);

  useEffect(() => {
    if (timeLeft <= 0) handleRefresh();
  }, [timeLeft]);

  const handleRefresh = useCallback(() => {
    setQrLoaded(false);
    setToken(generateToken());
    setTimeLeft(QR_TTL);
    showToast("QR Code diperbarui!");
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    setStudents((prev) => prev.map((s) => s.id === id ? { ...s, status: newStatus } : s));
    try {
      await apiClient.put(`/api/dosen/presensi/${id}/status`, { status: newStatus });
      showToast("Status diperbarui");
    } catch (error) {
      showToast("Gagal memperbarui status", "error");
    }
  };

  const statCount = (status) => students.filter((s) => s.status === status).length;
  const urgency = timeLeft < 60 ? "urgent" : timeLeft < 5 * 60 ? "warning" : "normal";

  const endSession = () => {
    setSessionActive(false);
    showToast("Sesi presensi telah ditutup.");
  };

  return (
    <div className="page-shell" style={{ backgroundColor: "var(--color-background)" }}>
      {/* Toast */}
      {toast && (
        <div className={`dp-toast dp-toast--${toast.type}`}>
          <span className="material-symbols-outlined">{toast.type === "success" ? "check_circle" : "error"}</span>
          {toast.msg}
        </div>
      )}

      <SidebarDosen onNavigate={onNavigate} onLogout={onLogout} activePage="dosenPresensi" mobileOpen={sidebarOpen} onClose={closeSidebar} />

      <main className="page-main" style={{ backgroundColor: "var(--color-background)" }}>
        <Navbar role="Dosen" onOpenSidebar={openSidebar} onNavigate={typeof nav !== "undefined" ? nav : (typeof onNavigate !== "undefined" ? onNavigate : undefined)} />

        <div className="page-content">
          {/* Top bar */}
          <div className="dp-topbar">
            <div>
              <h2 className="dp-page-title">Manajemen Presensi</h2>
              <p className="dp-page-sub">Hasilkan QR Code presensi dan pantau kehadiran mahasiswa secara real-time.</p>
            </div>
            <div className="dp-top-actions" style={{ position: 'relative' }}>
              <div className="dp-matkul-selector" onClick={() => setShowMatkul(!showMatkul)}>
                <span className="material-symbols-outlined">menu_book</span>
                <span>{selectedMatkul.name}</span>
                <span className="material-symbols-outlined">expand_more</span>
                {showMatkul && (
                  <div className="dp-matkul-dropdown">
                    {mataKuliahList.map((mk) => (
                      <button key={mk.id} className={`dp-matkul-opt ${selectedMatkul.id === mk.id ? "active" : ""}`}
                        onClick={(e) => { e.stopPropagation(); setSelectedMatkul(mk); setShowMatkul(false); handleRefresh(); }}>
                        <strong>{mk.name}</strong>
                        <span>{mk.time}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button className="dp-btn-outline" onClick={() => setShowJadwal(!showJadwal)}>
                <span className="material-symbols-outlined">calendar_month</span>
                Pilih Tanggal
              </button>
              {showJadwal && (
                <div className="dp-jadwal-popup" onClick={(e) => e.stopPropagation()}>
                  <div className="dp-jadwal-header">
                    <span>Pilih Tanggal Presensi</span>
                    <button onClick={() => setShowJadwal(false)}>×</button>
                  </div>
                  <input 
                    type="date" 
                    className="dp-date-input"
                    value={tempDate}
                    onChange={(e) => setTempDate(e.target.value)}
                  />
                  <button
                    className="dp-btn-save-jadwal"
                    onClick={async () => {
                      if (tempDate) {
                        setSelectedDateFilter(tempDate);
                        setShowJadwal(false);
                        setSessionActive(true);
                        try {
                          await apiClient.post(`/api/dosen/presensi/matkul/${selectedMatkul.id}/generate`, { tanggal: tempDate });
                          showToast(`Sesi dibuat untuk tanggal ${new Date(tempDate).toLocaleDateString('id-ID')}`);
                          setTimeout(() => fetchStudents(), 500);
                        } catch (err) {
                          if (err.message.includes('sudah ada')) {
                            showToast(`Menampilkan data tanggal ${new Date(tempDate).toLocaleDateString('id-ID')}`);
                            setTimeout(() => fetchStudents(), 500);
                          } else {
                            showToast(err.message || "Gagal membuat sesi", "error");
                          }
                        }
                      } else {
                        setSelectedDateFilter("semua");
                        setShowJadwal(false);
                        showToast("Pilih tanggal atau tampilkan semua");
                      }
                    }}
                  >
                    Simpan
                  </button>
                </div>
              )}
              <button className="dp-btn-outline" onClick={() => showToast("Laporan diunduh!")}>
                <span className="material-symbols-outlined">download</span>
                Unduh Laporan
              </button>
              {sessionActive ? (
                <button className="dp-btn-danger" onClick={endSession}>
                  <span className="material-symbols-outlined">stop_circle</span>
                  Tutup Sesi
                </button>
              ) : (
                <button className="dp-btn-primary" onClick={async () => {
                  if (!selectedMatkul?.id) {
                    showToast("Pilih mata kuliah terlebih dahulu", "error");
                    return;
                  }
                  try {
                    await apiClient.post(`/api/dosen/presensi/matkul/${selectedMatkul.id}/generate`);
                    setSessionActive(true);
                    handleRefresh();
                    showToast("Sesi presensi berhasil dibuat!");
                  } catch (error) {
                    if (error.message.includes('sudah ada')) {
                      setSessionActive(true);
                      handleRefresh();
                      showToast("Sesi hari ini sudah ada");
                    } else {
                      showToast(error.message || "Gagal membuat sesi", "error");
                    }
                  }
                }}>
                  <span className="material-symbols-outlined">play_circle</span>
                  Buka Sesi
                </button>
              )}
            </div>
          </div>

          {/* Upper grid: QR + Session Info */}
          <div className="dp-upper-grid">
            {/* QR Card */}
            <div className="dp-qr-card">
              <div className="dp-qr-header">
                <h3>Kode QR Presensi</h3>
                <p>Tampilkan ke kelas atau bagikan ke mahasiswa</p>
              </div>
              <div className="dp-qr-frame">
                {!qrLoaded && (
                  <div className="dp-qr-skeleton">
                    <span className="material-symbols-outlined">qr_code_2</span>
                    <span>Memuat QR...</span>
                  </div>
                )}
                <img
                  key={token}
                  src={qrUrl(token)}
                  alt="QR Code Presensi"
                  className={`dp-qr-img ${qrLoaded ? "dp-qr-img--visible" : ""} ${!sessionActive ? "dp-qr-img--expired" : ""}`}
                  onLoad={() => setQrLoaded(true)}
                />
                {!sessionActive && (
                  <div className="dp-qr-overlay">
                    <span className="material-symbols-outlined">lock</span>
                    <span>Sesi Ditutup</span>
                  </div>
                )}
              </div>
              <div className="dp-qr-token">
                <span className="dp-token-label">Token (untuk input manual)</span>
                <code className="dp-token-value">{token}</code>
              </div>
              <div className="dp-qr-footer">
                <div className="dp-ttl-info">
                  <span className="dp-ttl-label">Masa Berlaku</span>
                  <span className={`dp-ttl-value dp-ttl--${urgency}`}>{fmtTime(timeLeft)} Menit</span>
                </div>
                <div className="dp-ttl-bar-track">
                  <div className={`dp-ttl-bar-fill dp-ttl--${urgency}`} style={{ width: `${(timeLeft / QR_TTL) * 100}%` }} />
                </div>
                <div className="dp-qr-actions">
                  <button className="dp-btn-refresh" onClick={handleRefresh}>
                    <span className="material-symbols-outlined">refresh</span>
                    Perbarui
                  </button>
                  <button className="dp-btn-share" onClick={() => showToast("Link presensi disalin!")}>
                    <span className="material-symbols-outlined">share</span>
                    Bagikan
                  </button>
                </div>
              </div>
            </div>

            {/* Right: session info + stats */}
            <div className="dp-info-col">
              <div className="dp-session-card">
                <span className="dp-chip">SESI AKTIF</span>
                <h2 className="dp-session-title">{selectedMatkul.name}</h2>
                <div className="dp-session-details">
                  <div className="dp-detail-item">
                    <span className="material-symbols-outlined">schedule</span>
                    <div>
                      <p className="dp-detail-label">Waktu Perkuliahan</p>
                      <p className="dp-detail-value">{selectedMatkul.time} WIB</p>
                    </div>
                  </div>
                  <div className="dp-detail-item">
                    <span className="material-symbols-outlined">meeting_room</span>
                    <div>
                      <p className="dp-detail-label">Ruangan</p>
                      <p className="dp-detail-value">{selectedMatkul.room}</p>
                    </div>
                  </div>
                  <div className="dp-detail-item">
                    <span className="material-symbols-outlined">tag</span>
                    <div>
                      <p className="dp-detail-label">Kode Mata Kuliah</p>
                      <p className="dp-detail-value">{selectedMatkul.id}</p>
                    </div>
                  </div>
                  <div className="dp-detail-item">
                    <span className="material-symbols-outlined">circle</span>
                    <div>
                      <p className="dp-detail-label">Status Sesi</p>
                      <p className={`dp-detail-value ${sessionActive ? "dp-status--active" : "dp-status--closed"}`}>
                        {sessionActive ? "● Berlangsung" : "● Ditutup"}
                      </p>
                    </div>
                  </div>
                  <div className="dp-detail-item">
                    <span className="material-symbols-outlined">calendar_month</span>
                    <div>
                      <p className="dp-detail-label">Jadwal Mingguan</p>
                      <p className="dp-detail-value">
                        {selectedMatkul.jadwal || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="dp-stats-grid">
                {[
                  { label: "HADIR",  value: statCount("Hadir"), color: "#2f9696", icon: "check_circle" },
                  { label: "SAKIT",  value: statCount("Sakit"), color: "#4b53bc", icon: "medication" },
                  { label: "IZIN",   value: statCount("Izin"),  color: "#c47f17", icon: "event_busy" },
                  { label: "ALPA",   value: statCount("Alpa"),  color: "#dc2626", icon: "cancel" },
                ].map((s) => (
                  <div key={s.label} className="dp-stat-card">
                    <span className="material-symbols-outlined dp-stat-icon" style={{ color: s.color }}>{s.icon}</span>
                    <p className="dp-stat-label">{s.label}</p>
                    <p className="dp-stat-value" style={{ color: s.color }}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Student Table */}
          <div className="dp-table-card">
            <div className="dp-table-header">
              <div>
                <h3>Daftar Hadir Mahasiswa</h3>
                <p>{students.filter(s => selectedDateFilter === "semua" || (s.tanggalPertemuan && new Date(s.tanggalPertemuan).toISOString().split('T')[0] === selectedDateFilter)).length} mahasiswa</p>
              </div>
              <div className="dp-table-actions">
                <button className="dp-icon-btn" onClick={() => { fetchStudents(); showToast("Data diperbarui!"); }}>
                  <span className="material-symbols-outlined">refresh</span>
                </button>
                <select 
                  className="dp-date-filter"
                  value={selectedDateFilter}
                  onChange={(e) => setSelectedDateFilter(e.target.value)}
                >
                  <option value="semua">Semua Tanggal</option>
                  {availableDates.map(date => (
                    <option key={date} value={date}>
                      {new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="dp-table-wrap">
              <table className="dp-table">
                <thead>
                  <tr>
                    <th>NAMA MAHASISWA</th>
                    <th>NIM</th>
                    <th>WAKTU PRESENSI</th>
                    <th>STATUS KEHADIRAN</th>
                    <th>AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {students
                    .filter(s => {
                      if (selectedDateFilter === "semua") return true;
                      let sDate = null;
                      if (s.tanggalPertemuan) {
                        if (typeof s.tanggalPertemuan === 'string' && s.tanggalPertemuan.includes('T')) {
                          sDate = s.tanggalPertemuan.split('T')[0];
                        } else {
                          sDate = new Date(s.tanggalPertemuan).toISOString().split('T')[0];
                        }
                      }
                      return sDate === selectedDateFilter;
                    })
                    .map((s) => (
                    <tr key={s.id}>
                      <td>
                        <div className="dp-student-cell">
                          {s.photo ? (
                            <img src={s.photo} alt={s.name} className="dp-avatar-img" />
                          ) : (
                            <div className="dp-avatar-initials" style={{ backgroundColor: s.color }}>{s.initials}</div>
                          )}
                          <span className="dp-student-name">{s.name}</span>
                        </div>
                      </td>
                      <td className="dp-nim">{s.nim}</td>
                      <td className="dp-time">
                        {s.waktuPresensi ? new Date(s.waktuPresensi).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td>
                        <div className="dp-status-wrap">
                          <select
                            className="dp-status-select"
                            style={{ color: statusColor(s.status) }}
                            value={s.status}
                            onChange={(e) => handleStatusChange(s.id, e.target.value)}
                          >
                            {STATUS_OPTS.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                          <span className="material-symbols-outlined dp-select-icon" style={{ color: statusColor(s.status) }}>expand_more</span>
                        </div>
                      </td>
                      <td>
                        <button className="dp-action-btn" onClick={() => showToast(`Aksi untuk ${s.name}`)}>
                          <span className="material-symbols-outlined">more_horiz</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="dp-pagination-row">
              <p className="dp-pagination-info">Menampilkan {students.length} mahasiswa terdaftar</p>
              <div className="dp-pagination">
                {[1,2,3].map((n) => (
                  <button key={n} className={`dp-page-btn ${page === n ? "dp-page-btn--active" : ""}`} onClick={() => setPage(n)}>{n}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
