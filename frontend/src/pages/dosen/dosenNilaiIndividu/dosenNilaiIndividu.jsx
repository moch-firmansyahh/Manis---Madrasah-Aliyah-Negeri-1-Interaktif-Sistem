import React, { useState, useEffect } from "react";
import "../../../shared.css";
import "./dosenNilaiIndividu.css";
import SidebarDosen from "../../../SidebarDosen";
import { useSidebar } from "../../../useSidebar";
import Navbar from "../../../Navbar";
import { apiClient } from "../../../utils/apiClient";

const MEMBER_COLORS = ["#4b53bc", "#2f9696", "#c47f17", "#7c3aed", "#0891b2", "#059669", "#dc2626", "#be185d", "#8991fe"];

function initials(name) {
  if (!name) return "?";
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

export default function DosenNilaiIndividu({ onNavigate, onLogout }) {
  const { sidebarOpen, openSidebar, closeSidebar } = useSidebar();
  const [mataKuliahList, setMataKuliahList] = useState([]);
  const [selectedMk, setSelectedMk] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [filter, setFilter] = useState("semua");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [nilaiModal, setNilaiModal] = useState(null);
  const [nilaiInput, setNilaiInput] = useState("");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchMataKuliah();
  }, []);

  useEffect(() => {
    if (selectedMk) {
      fetchSubmissions();
    }
  }, [selectedMk]);

  const fetchMataKuliah = async () => {
    try {
      const res = await apiClient.get('/api/mata-kuliah');
      console.log("Mata Kuliah response:", res);
      const data = res?.data || res;
      if (Array.isArray(data)) {
        setMataKuliahList(data);
      }
    } catch (error) {
      console.error("Gagal memuat mata kuliah:", error);
    }
  };

  const fetchSubmissions = async () => {
    if (!selectedMk) return;
    setLoading(true);
    setSubmissions([]);
    try {
      const res = await apiClient.get(`/api/nilai/submissions/individu/${selectedMk}`);
      
      let data = [];
      if (res?.data) data = res.data;
      else if (Array.isArray(res)) data = res;
      
      setSubmissions(data);
    } catch (error) {
      console.error("Gagal memuat pengumpulan:", error);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(s => {
    if (filter === "sudah") return s.nilai !== null;
    if (filter === "belum") return s.nilai === null;
    return true;
  });

  const openNilaiModal = (submission) => {
    setNilaiModal(submission);
    setNilaiInput(submission.nilai !== null ? String(submission.nilai) : "");
  };

  const saveNilai = async () => {
    if (!nilaiModal) return;
    const nilai = parseFloat(nilaiInput);
    if (isNaN(nilai) || nilai < 0 || nilai > 100) {
      showToast("Nilai harus antara 0-100", "error");
      return;
    }
    try {
      await apiClient.post('/api/nilai/submissions/nilai', {
        nomorInduk: nilaiModal.nomorInduk,
        idMataKuliah: selectedMk,
        nilaiTugas: nilai
      });
      showToast("Nilai berhasil disimpan!");
      setNilaiModal(null);
      fetchSubmissions();
    } catch (error) {
      showToast(error.message || "Gagal menyimpan nilai", "error");
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const getLetterGrade = (nilai) => {
    if (nilai === null || nilai === undefined) return "-";
    if (nilai >= 85) return "A";
    if (nilai >= 70) return "B";
    if (nilai >= 55) return "C";
    return "D";
  };

  const getColor = (nim) => {
    const idx = submissions.findIndex(s => s.nim === nim);
    return MEMBER_COLORS[idx >= 0 ? idx % MEMBER_COLORS.length : 0];
  };

  return (
    <div className="page-shell" style={{ backgroundColor: "var(--color-background)" }}>
      {toast && (
        <div className={`dni-toast dni-toast--${toast.type}`}>
          <span className="material-symbols-outlined">
            {toast.type === "success" ? "check_circle" : "error"}
          </span>
          {toast.msg}
        </div>
      )}

      {nilaiModal && (
        <div className="dni-overlay" onClick={() => setNilaiModal(null)}>
          <div className="dni-modal" onClick={e => e.stopPropagation()}>
            <div className="dni-modal-header">
              <h3>Beri Nilai</h3>
              <button className="dni-modal-close" onClick={() => setNilaiModal(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="dni-modal-body">
              <div className="dni-student-info">
                <div className="dni-avatar" style={{ background: getColor(nilaiModal.nim) }}>
                  {initials(nilaiModal.nama)}
                </div>
                <div>
                  <p className="dni-student-name">{nilaiModal.nama}</p>
                  <p className="dni-student-nim">{nilaiModal.nim}</p>
                </div>
              </div>
              <p className="dni-task-title">
                <strong>Tugas:</strong> {nilaiModal.tugas?.judul || "-"}
              </p>
              <div className="dni-input-group">
                <label>Nilai Tugas</label>
                <div className="dni-input-wrap">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={nilaiInput}
                    onChange={e => setNilaiInput(e.target.value)}
                    placeholder="0-100"
                    className="dni-input"
                  />
                  <span className="dni-input-suffix">/100</span>
                </div>
                {nilaiInput && (
                  <span className="dni-letter-grade">
                    Grade: {getLetterGrade(parseFloat(nilaiInput))}
                  </span>
                )}
              </div>
            </div>
            <div className="dni-modal-footer">
              <button className="dni-btn-cancel" onClick={() => setNilaiModal(null)}>
                Batal
              </button>
              <button className="dni-btn-save" onClick={saveNilai}>
                <span className="material-symbols-outlined">save</span>
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      <SidebarDosen
        onNavigate={onNavigate}
        onLogout={onLogout}
        activePage="dosenNilaiIndividu"
        mobileOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      <main className="page-main" style={{ backgroundColor: "var(--color-background)" }}>
        <Navbar
          role="Dosen"
          onOpenSidebar={openSidebar}
          onNavigate={typeof nav !== "undefined" ? nav : (typeof onNavigate !== "undefined" ? onNavigate : undefined)}
        />

        <div className="page-content">
          <div className="dni-header">
            <div>
              <h2 className="dni-title">Nilai Tugas Individu</h2>
              <p className="dni-subtitle">Beri penilaian untuk tugas individu mahasiswa</p>
            </div>
          </div>

          <div className="dni-filters">
            <div className="dni-select-wrap">
              <label>Mata Kuliah</label>
              <select
                value={selectedMk}
                onChange={e => setSelectedMk(e.target.value)}
                className="dni-select"
              >
                <option value="">-- Pilih Mata Kuliah --</option>
                {mataKuliahList.map(mk => (
                  <option key={mk.idMataKuliah} value={mk.idMataKuliah}>
                    {mk.namaMataKuliah}
                  </option>
                ))}
              </select>
            </div>

            <div className="dni-tabs">
              <button
                className={`dni-tab ${filter === "semua" ? "dni-tab--active" : ""}`}
                onClick={() => setFilter("semua")}
              >
                Semua ({submissions.length})
              </button>
              <button
                className={`dni-tab ${filter === "sudah" ? "dni-tab--active" : ""}`}
                onClick={() => setFilter("sudah")}
              >
                Sudah Dinilai ({submissions.filter(s => s.nilai !== null).length})
              </button>
              <button
                className={`dni-tab ${filter === "belum" ? "dni-tab--active" : ""}`}
                onClick={() => setFilter("belum")}
              >
                Belum Dinilai ({submissions.filter(s => s.nilai === null).length})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="dni-loading">
              <span className="material-symbols-outlined">hourglass_empty</span>
              <p>Memuat data...</p>
            </div>
          ) : !selectedMk ? (
            <div className="dni-empty">
              <span className="material-symbols-outlined">school</span>
              <p>Pilih mata kuliah untuk melihat pengumpulan tugas</p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="dni-empty">
              <span className="material-symbols-outlined">inbox</span>
              <p>Tidak ada pengumpulan tugas individu</p>
            </div>
          ) : (
            <div className="dni-table-wrap">
              <table className="dni-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Mahasiswa</th>
                    <th>Tugas</th>
                    <th>Tanggal Kumpul</th>
                    <th>Nilai</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((s, i) => (
                    <tr key={s.idPengumpulan}>
                      <td className="dni-cell-no">{i + 1}</td>
                      <td>
                        <div className="dni-student-cell">
                          <div className="dni-avatar-sm" style={{ background: getColor(s.nim) }}>
                            {initials(s.nama)}
                          </div>
                          <div>
                            <p className="dni-name">{s.nama}</p>
                            <p className="dni-nim">{s.nim}</p>
                          </div>
                        </div>
                      </td>
                      <td className="dni-cell-tugas">
                        {s.tugas?.judul || "-"}
                      </td>
                      <td>{formatDate(s.tanggalKumpul)}</td>
                      <td>
                        {s.nilai !== null ? (
                          <span className="dni-nilai-badge">
                            {s.nilai} ({getLetterGrade(s.nilai)})
                          </span>
                        ) : (
                          <span className="dni-nilai-badge dni-nilai-badge--empty">-</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="dni-btn-nilai"
                          onClick={() => openNilaiModal(s)}
                        >
                          <span className="material-symbols-outlined">edit</span>
                          Nilai
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}