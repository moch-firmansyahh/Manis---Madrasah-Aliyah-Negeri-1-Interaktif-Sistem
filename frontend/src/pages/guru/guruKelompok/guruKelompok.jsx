import React, { useState, useEffect } from "react";
import "../../../components/shared.css";
import "./guruKelompok.css";
import SidebarGuru from "../../../components/SidebarGuru";
import { useSidebar } from "../../../components/useSidebar";
import Navbar from "../../../components/Navbar";
import { useGuruClass } from "../../../contexts/GuruClassContext";
import { apiClient, API_URL } from "../../../utils/apiClient";

const API_BASE = API_URL;

const AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBjoXu55KCdSSPl-2t0t7d2EH6gux6Xz8nZaCdXHePrj-gGn1ZWZyBoOucWc2yVgrhmNFyy8cKbxWH8i9Wm5VKkpqX9jraXjkHTr8PVU1oN3V4nkzLWUUm6nyAIS3hGDic_uY0YoNLNNZluKTKqFwJb2gYlRl9eATGdlXClTx6IXpYvk-2u1qqvfUGTzs-QJPlXTouWTyNYzTe8j8mS09evVA_aHTYfHxneVwUsb2jUygYzuAIDU5KwqO2kISzLvnzaTentePscoGoo";

const MEMBER_COLORS = ["#4b53bc", "#2f9696", "#c47f17", "#7c3aed", "#0891b2", "#059669", "#dc2626", "#be185d", "#8991fe"];

function initials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}
function statusColor(status) {
  return (
    {
      "On-Track": "#2f9696",
      Behind: "#dc2626",
      Completed: "#059669",
      "Not Started": "#94a3b8",
    }[status] ?? "#94a3b8"
  );
}
function statusBg(status) {
  return (
    {
      "On-Track": "#f0fdfa",
      Behind: "#fff1f2",
      Completed: "#ecfdf5",
      "Not Started": "#f1f5f9",
    }[status] ?? "#f1f5f9"
  );
}

export default function GuruKelompok({ onNavigate, onLogout }) {
  const { sidebarOpen, openSidebar, closeSidebar } = useSidebar();
  const [groups, setGroups] = useState([]);
  const [toast, setToast] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [nilaiModal, setNilaiModal] = useState(null);
  const [gradeInputs, setGradeInputs] = useState({});
  const [addMemberModal, setAddMemberModal] = useState(null);
  const [createModal, setCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupTask, setNewGroupTask] = useState("");
  const [allStudents, setAllStudents] = useState([]);
  const [mataKuliahList, setMataKuliahList] = useState([]);
  const [selectedMkId, setSelectedMkId] = useState("");
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(null);
  const { selectedClass, clearClass } = useGuruClass();

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const normalizeGroup = (g) => {
    const members = (g.members || []).map(m =>
      typeof m === 'string' ? { nis: m, name: m, nomorInduk: m } : m
    );
    return { ...g, members, nilai: g.nilai || {} };
  };

  const fetchGroups = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedClass) params.append('idKelas', selectedClass.idKelas);
      const queryStr = params.toString() ? `?${params.toString()}` : '';
      const res = await apiClient.get(`/api/kelompok${queryStr}`);
      const data = res?.data || res;
      if (Array.isArray(data)) {
        setGroups(data.map(normalizeGroup));
      }
    } catch (error) {
      console.error("Gagal memuat kelompok:", error);
    }
  };

  const fetchAllStudents = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedClass) params.append('idKelas', selectedClass.idKelas);
      const queryStr = params.toString() ? `?${params.toString()}` : '';
      const data = await apiClient.get(`/api/kelompok/siswa/all${queryStr}`);
      if (Array.isArray(data)) {
        setAllStudents(data);
      }
    } catch (error) {
      console.error("Gagal memuat siswa:", error);
    }
  };

  useEffect(() => {
    if (selectedClass) {
      fetchGroups();
      fetchAllStudents();
      fetchCourses();
    }
  }, [selectedClass]);

  const fetchCourses = async () => {
    try {
      const res = await apiClient.get('/api/mata-kuliah');
      const data = Array.isArray(res) ? res : (res.data || []);
      const filteredData = selectedClass
        ? data.filter(mk => mk.kelas && mk.kelas.idKelas === selectedClass.idKelas)
        : data;
      setMataKuliahList(filteredData);
    } catch (error) {
      console.error("Gagal memuat mata pelajaran:", error);
    }
  };

  const visibleGroups = groups;

  const openNilai = (group) => {
    setGradeInputs({ ...group.nilai });
    setNilaiModal(group);
  };

  const saveNilai = async () => {
    try {
      await apiClient.put(`/api/kelompok/${nilaiModal.id}/grades`, {
        grades: gradeInputs
      });
      setNilaiModal(null);
      showToast("Nilai berhasil disimpan!");
      fetchGroups();
    } catch (error) {
      showToast("Gagal menyimpan nilai", "error");
    }
  };

  const removeMember = async (groupId, studentId) => {
    try {
      await apiClient.delete(`/api/kelompok/${groupId}/members/${studentId}`);
      showToast("Anggota dikeluarkan.");
      await fetchGroups();
    } catch (error) {
      showToast("Gagal mengeluarkan", "error");
    }
  };

  const addMember = async (groupId, nis) => {
    try {
      await apiClient.post(`/api/kelompok/${groupId}/members`, {
        nis: nis
      });
      showToast("Anggota berhasil ditambahkan!");
      await fetchGroups();
    } catch (error) {
      showToast(error.message || "Gagal menambahkan anggota", "error");
    }
  };

  const createGroup = async () => {
    if (!newGroupName.trim()) {
      showToast("Nama kelompok wajib diisi.", "error");
      return;
    }
    if (!selectedMkId) {
      showToast("Pilih mata pelajaran terlebih dahulu.", "error");
      return;
    }
    try {
      await apiClient.post('/api/kelompok', {
        name: newGroupName.trim(),
        idMataKuliah: parseInt(selectedMkId),
        task: newGroupTask.trim() || null
      });
      setNewGroupName("");
      setNewGroupTask("");
      setSelectedMkId("");
      setCreateModal(false);
      showToast("Kelompok berhasil dibuat!");
      fetchGroups();
    } catch (error) {
      showToast(error.message || "Gagal membuat kelompok", "error");
    }
  };

  const handleDeleteGroup = (groupId, groupName) => {
    setDeleteConfirmModal({ id: groupId, name: groupName });
  };

  const confirmDeleteGroup = async () => {
    if (!deleteConfirmModal) return;
    const { id, name } = deleteConfirmModal;
    try {
      await apiClient.delete(`/api/kelompok/${id}`);
      setDeleteConfirmModal(null);
      showToast(`Kelompok "${name}" berhasil dihapus!`);
      fetchGroups();
    } catch (error) {
      showToast("Gagal menghapus kelompok", "error");
    }
  };

  const getMemberColor = (nis) => {
    const idx = allStudents.findIndex(s => s.nis === nis);
    return MEMBER_COLORS[idx >= 0 ? idx % MEMBER_COLORS.length : 0];
  };

  const availableStudents = (groupId) => {
    const targetGroup = groups.find(g => g.id === groupId);
    if (!targetGroup) return allStudents;
    // Exclude siswa yang sudah ada di kelompok manapun dalam matkul yang sama
    const sameMkGroups = groups.filter(g => g.idMataKuliah === targetGroup.idMataKuliah);
    const alreadyInAnyGroup = new Set(
      sameMkGroups.flatMap(g => g.members.map(m => m.nis))
    );
    return allStudents.filter((s) => !alreadyInAnyGroup.has(s.nis));
  };

  if (!selectedClass) {
    return (
      <div className="page-shell">
        <SidebarGuru onNavigate={onNavigate} onLogout={onLogout} activePage="guruKelompok" mobileOpen={sidebarOpen} onClose={closeSidebar} />
        <main className="page-main">
          <Navbar role="Guru" onOpenSidebar={openSidebar} onNavigate={onNavigate} />
          <div style={{ textAlign: "center", padding: "4rem" }}>
            <h3>Belum memilih kelas</h3>
            <p style={{ margin: "1rem 0" }}>Silakan pilih kelas terlebih dahulu melalui Dashboard.</p>
            <button onClick={() => onNavigate && onNavigate("guruDashboard")} style={{ padding: "0.5rem 1.5rem", backgroundColor: "var(--color-primary)", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>
              Kembali ke Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      className="page-shell"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      {/* Toast */}
      {toast && (
        <div className={`dk-toast dk-toast--${toast.type}`}>
          <span className="material-symbols-outlined">
            {toast.type === "success" ? "check_circle" : "error"}
          </span>
          {toast.msg}
        </div>
      )}

      {/* Nilai Modal */}
      {nilaiModal && (
        <div className="dk-overlay" onClick={() => setNilaiModal(null)}>
          <div className="dk-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dk-modal-header">
              <div>
                <h3>Beri Nilai — {nilaiModal.name}</h3>
                <p>{nilaiModal.task}</p>
              </div>
              <button
                className="dk-modal-close"
                onClick={() => setNilaiModal(null)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="dk-modal-body">
              {nilaiModal.members.map((member) => (
                  <div key={member.nis} className="dk-grade-row">
                    <div className="dk-grade-student">
                      <div
                        className="dk-avatar-sm"
                        style={{ background: getMemberColor(member.nis) }}
                      >
                        {initials(member.name)}
                      </div>
                      <div>
                        <p className="dk-grade-name">{member.name}</p>
                        <p className="dk-grade-nis">{member.nis}</p>
                      </div>
                    </div>
                    <div className="dk-grade-input-wrap">
                      <input
                        className="dk-grade-input"
                        type="number"
                        min={0}
                        max={100}
                        placeholder="0-100"
                        value={gradeInputs[member.nis] ?? ""}
                        onChange={(e) =>
                          setGradeInputs({
                            ...gradeInputs,
                            [member.nis]: e.target.value,
                          })
                        }
                      />
                      <span className="dk-grade-scale">/100</span>
                      {gradeInputs[member.nis] && (
                        <span className="dk-letter-grade">
                          {+gradeInputs[member.nis] >= 85
                            ? "A"
                            : +gradeInputs[member.nis] >= 70
                              ? "B"
                              : +gradeInputs[member.nis] >= 55
                                ? "C"
                                : "D"}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
            <div className="dk-modal-footer">
              <button
                className="dk-btn-cancel"
                onClick={() => setNilaiModal(null)}
              >
                Batal
              </button>
              <button className="dk-btn-save" onClick={saveNilai}>
                <span className="material-symbols-outlined">save</span>
                Simpan Nilai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal && (
        <div className="dk-overlay" onClick={() => setDeleteConfirmModal(null)}>
          <div
            className="dk-modal dk-modal--sm"
            style={{
              maxWidth: "400px",
              textAlign: "center",
              padding: "2rem",
              borderRadius: "var(--radius-lg)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "1.25rem"
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "4rem",
                height: "4rem",
                borderRadius: "50%",
                backgroundColor: "#fee2e2",
                color: "#dc2626"
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: "2.5rem" }}>warning</span>
              </div>
            </div>
            
            <h3 style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "var(--slate-800)",
              margin: "0 0 0.75rem 0"
            }}>
              Hapus Kelompok?
            </h3>
            
            <p style={{
              fontSize: "0.9rem",
              color: "var(--slate-600)",
              lineHeight: "1.5",
              margin: "0 0 2rem 0"
            }}>
              Apakah Anda yakin ingin menghapus kelompok <strong>"{deleteConfirmModal.name}"</strong>? 
              <br />
              <span style={{ fontSize: "0.8rem", color: "#ef4444", fontWeight: 500, marginTop: "0.5rem", display: "inline-block" }}>
                * Tindakan ini permanen. Semua anggota dan pengumpulan tugas kelompok ini juga akan terhapus.
              </span>
            </p>
            
            <div style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "center"
            }}>
              <button
                className="dk-btn-cancel"
                style={{
                  margin: 0,
                  flex: 1,
                  padding: "0.75rem",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border)",
                  backgroundColor: "white",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onClick={() => setDeleteConfirmModal(null)}
              >
                Batal
              </button>
              <button
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  backgroundColor: "#dc2626",
                  color: "white",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  transition: "all 0.2s"
                }}
                onClick={confirmDeleteGroup}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#b91c1c"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#dc2626"}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>delete</span>
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {addMemberModal && (
        <div className="dk-overlay" onClick={() => setAddMemberModal(null)}>
          <div className="dk-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dk-modal-header">
              <div>
                <h3>Tambah Anggota</h3>
                <p>{groups.find((g) => g.id === addMemberModal)?.name}</p>
              </div>
              <button
                className="dk-modal-close"
                onClick={() => setAddMemberModal(null)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="dk-modal-body">
              {availableStudents(addMemberModal).length === 0 ? (
                <p className="dk-empty-state">
                  Semua siswa sudah tergabung dalam kelompok.
                </p>
              ) : (
                availableStudents(addMemberModal).map((s) => (
                  <div key={s.nis} className="dk-member-option">
                    <div
                      className="dk-avatar-sm"
                      style={{ background: getMemberColor(s.nis) }}
                    >
                      {initials(s.name)}
                    </div>
                    <div className="dk-member-info">
                      <p className="dk-member-name">{s.name}</p>
                      <p className="dk-member-nis">{s.nis}</p>
                    </div>
                    <button
                      className="dk-btn-add-member"
                      onClick={() => addMember(addMemberModal, s.nis)}
                    >
                      <span className="material-symbols-outlined">add</span>
                      Tambah
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {createModal && (
        <div className="dk-overlay" onClick={() => setCreateModal(false)}>
          <div
            className="dk-modal dk-modal--sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dk-modal-header">
              <h3>Buat Kelompok Baru</h3>
              <button
                className="dk-modal-close"
                onClick={() => setCreateModal(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="dk-modal-body">
              <div className="dk-field">
                <label className="dk-label">Mata Pelajaran</label>
                <select
                  className="dk-input"
                  value={selectedMkId}
                  onChange={(e) => setSelectedMkId(e.target.value)}
                >
                  <option value="">— Pilih Mata Pelajaran —</option>
                  {mataKuliahList.map((mk) => (
                    <option key={mk.idMataKuliah} value={mk.idMataKuliah}>
                      {mk.namaMataKuliah}
                    </option>
                  ))}
                </select>
              </div>
              <div className="dk-field">
                <label className="dk-label">Nama Kelompok</label>
                <input
                  className="dk-input"
                  placeholder="Kelompok Delta..."
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
              </div>
              <div className="dk-field">
                <label className="dk-label">Nama Tugas <span style={{ color: "#94a3b8", fontWeight: 400 }}>(opsional)</span></label>
                <input
                  className="dk-input"
                  placeholder="Misal: Proyek Akhir Semester..."
                  value={newGroupTask}
                  onChange={(e) => setNewGroupTask(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createGroup()}
                />
              </div>
            </div>
            <div className="dk-modal-footer">
              <button
                className="dk-btn-cancel"
                onClick={() => setCreateModal(false)}
              >
                Batal
              </button>
              <button className="dk-btn-save" onClick={createGroup}>
                <span className="material-symbols-outlined">add</span>
                Buat Kelompok
              </button>
            </div>
          </div>
        </div>
      )}

      <SidebarGuru
        onNavigate={onNavigate}
        onLogout={onLogout}
        activePage="guruKelompok"
        mobileOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      <main
        className="page-main"
        style={{ backgroundColor: "var(--color-background)" }}
      >
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


        <div className="page-content">
          <div className="dk-topbar">
            <div>
              <h2 className="dk-page-title">Kelompok & Nilai</h2>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.375rem" }}>
                <span className="class-badge" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.375rem 0.75rem", background: "rgba(19, 116, 184, 0.1)", color: "#1374B8", border: "1px solid rgba(19, 116, 184, 0.2)", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "700" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>school</span>
                  Kelas: {selectedClass.namaKelas}
                </span>
                <button onClick={clearClass} className="dk-btn-cancel" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.375rem 0.75rem", border: "1px solid var(--color-border)", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>swap_horiz</span>
                  Ganti Kelas
                </button>
              </div>
            </div>
            <button
              className="dk-btn-primary"
              onClick={() => setCreateModal(true)}
            >
              <span className="material-symbols-outlined">group_add</span>
              Buat Kelompok
            </button>
          </div>

          {/* Stats */}
          <div className="dk-stats-row">
            {[
              {
                label: "Total Kelompok",
                value: visibleGroups.length,
                icon: "groups",
                color: "var(--color-secondary)",
              },
              {
                label: "On-Track",
                value: visibleGroups.filter((g) => g.status === "On-Track").length,
                icon: "trending_up",
                color: "#2f9696",
              },
              {
                label: "Terlambat",
                value: visibleGroups.filter((g) => g.status === "Behind").length,
                icon: "warning",
                color: "#dc2626",
              },
              {
                label: "Selesai",
                value: visibleGroups.filter((g) => g.status === "Completed").length,
                icon: "task_alt",
                color: "#059669",
              },
            ].map((s) => (
              <div key={s.label} className="dk-stat-mini">
                <span
                  className="material-symbols-outlined"
                  style={{ color: s.color }}
                >
                  {s.icon}
                </span>
                <div>
                  <p className="dk-stat-val" style={{ color: s.color }}>
                    {s.value}
                  </p>
                  <p className="dk-stat-lbl">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Groups */}
          <div className="dk-groups-grid">
            {visibleGroups.map((group) => {
              const graded = Object.values(group.nilai).filter(
                (v) => v !== "",
              ).length;
              return (
                <div key={group.id} className="dk-group-card">
                  {/* Card Header */}
                  <div
                    className="dk-group-header"
                    style={{ borderLeftColor: group.color }}
                  >
                    <div>
                      <h3 className="dk-group-name">{group.name}</h3>
                      <p className="dk-group-task">
                        <span className="material-symbols-outlined">
                          assignment
                        </span>
                        {group.task}
                      </p>
                      <p className="dk-group-task" style={{ color: "var(--color-secondary)", fontSize: "0.75rem" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "0.875rem" }}>
                          school
                        </span>
                        {group.mataKuliahName || "-"}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <span
                        className="dk-progress-status"
                        style={{
                          color: statusColor(group.status),
                          background: statusBg(group.status),
                        }}
                      >
                        {group.status}
                      </span>
                      <button
                        className="dk-delete-group-btn"
                        onClick={() => handleDeleteGroup(group.id, group.name)}
                        title="Hapus Kelompok"
                        style={{
                          background: "none",
                          border: "none",
                          color: "#dc2626",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "0.25rem",
                          borderRadius: "0.375rem",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#fee2e2"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "1.25rem" }}>delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="dk-group-progress">
                    <div className="dk-progress-hdr">
                      <span>Progress</span>
                      <span
                        style={{
                          color: statusColor(group.status),
                          fontWeight: 800,
                        }}
                      >
                        {group.progress}%
                      </span>
                    </div>
                    <div className="dk-progress-track">
                      <div
                        className="dk-progress-fill"
                        style={{
                          width: `${group.progress}%`,
                          background: group.color,
                        }}
                      />
                    </div>
                  </div>

                  {/* Members */}
                  <div className="dk-members-section">
                    <div className="dk-members-hdr">
                      <span className="dk-members-label">
                        Anggota ({group.members.length})
                      </span>
                      <button
                        className="dk-add-member-btn"
                        onClick={() => setAddMemberModal(group.id)}
                      >
                        <span className="material-symbols-outlined">
                          person_add
                        </span>
                        Tambah
                      </button>
                    </div>
                    <div className="dk-members-list">
                      {group.members.map((member) => {
                        const nilai = group.nilai[member.nis];
                        return (
                          <div key={member.nis} className="dk-member-row">
                            <div
                              className="dk-avatar-sm"
                              style={{ background: getMemberColor(member.nis) }}
                            >
                              {initials(member.name)}
                            </div>
                            <div className="dk-member-info">
                              <p className="dk-member-name">{member.name}</p>
                              <p className="dk-member-nis">{member.nis}</p>
                            </div>
                            <div className="dk-member-right">
                              {nilai ? (
                                <span className="dk-nilai-badge">{nilai}</span>
                              ) : (
                                <span className="dk-nilai-badge dk-nilai-badge--empty">
                                  –
                                </span>
                              )}
                              <button
                                className="dk-remove-btn"
                                onClick={() => removeMember(group.id, member.nis)}
                                title="Keluarkan anggota"
                              >
                                <span className="material-symbols-outlined">
                                  person_remove
                                </span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {group.members.length === 0 && (
                        <p className="dk-empty-members">Belum ada anggota</p>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="dk-group-footer">
                    <div className="dk-submission-info">
                      <span
                        className={`material-symbols-outlined ${group.submitted ? "dk-sub-yes" : "dk-sub-no"}`}
                      >
                        {group.submitted ? "check_circle" : "pending"}
                      </span>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                        <span className={group.submitted ? "dk-sub-yes" : "dk-sub-no"}>
                          {group.submitted ? "Sudah Dikumpulkan" : "Belum Dikumpulkan"}
                        </span>
                        {group.submitted && group.fileKumpulan && (
                          <a
                            href={`${API_BASE}${group.fileKumpulan}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: "0.75rem", color: "#4b53bc", display: "flex", alignItems: "center", gap: "0.25rem", textDecoration: "none" }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: "0.875rem" }}>download</span>
                            Lihat File
                          </a>
                        )}
                      </div>
                    </div>
                    <button
                      className="dk-grade-btn"
                      onClick={() => openNilai(group)}
                    >
                      <span className="material-symbols-outlined">grade</span>
                      Beri Nilai ({graded}/{group.members.length})
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
