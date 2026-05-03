import React, { useState } from "react";
import "../../../shared.css";
import Sidebar from "../../../Sidebar";
import { useSidebar } from "../../../useSidebar";
import Navbar from "../../../Navbar";
import { apiClient } from "../../../utils/apiClient";
import "./pengumpulanTugas.css";

export default function PengumpulanTugas({
  onNavigate,
  onLogout,
  idTugas,
  judul,
  mataKuliah,
  detailTugas,
  idMataKuliah,
}) {
  const { sidebarOpen, openSidebar, closeSidebar } = useSidebar();
  const [fileJawaban, setFileJawaban] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submitTask = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      await apiClient.post(`/api/tugas/${idTugas}/submit`, { fileJawaban });
      setMessage("Tugas berhasil dikumpulkan.");
    } catch (err) {
      setError(err.message || "Gagal mengumpulkan tugas");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <Sidebar
        onNavigate={onNavigate}
        onLogout={onLogout}
        activePage="daftarTugas"
        mobileOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      <main className="page-main">
        <Navbar role="Mahasiswa" onOpenSidebar={openSidebar} onNavigate={onNavigate} />
        <div className="page-content">
          <div className="pt-card">
            <h2>Pengumpulan Tugas</h2>
            <p className="pt-course">{mataKuliah || "-"}</p>
            <h3>{judul || "Tugas"}</h3>
            <p className="pt-detail">{detailTugas || "Tidak ada deskripsi tugas."}</p>

            <form onSubmit={submitTask}>
              <label htmlFor="fileJawaban">Link file jawaban / URL dokumen</label>
              <input
                id="fileJawaban"
                type="url"
                value={fileJawaban}
                onChange={(e) => setFileJawaban(e.target.value)}
                placeholder="https://..."
                required
              />

              {error ? <p className="pt-error">{error}</p> : null}
              {message ? <p className="pt-success">{message}</p> : null}

              <div className="pt-actions">
                <button
                  type="button"
                  className="pt-btn pt-btn-outline"
                  onClick={() =>
                    onNavigate &&
                    onNavigate({
                      page: "daftarTugas",
                      idMataKuliah,
                    })
                  }
                >
                  Kembali
                </button>
                <button type="submit" className="pt-btn pt-btn-primary" disabled={submitting}>
                  {submitting ? "Menyimpan..." : "Kumpulkan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
