import React, { useState, useEffect } from "react";
import "../../../shared.css";
import "./dosenKelompok.css";
import SidebarDosen from "../../../SidebarDosen";
import { useSidebar } from "../../../useSidebar";
import Navbar from "../../../Navbar";
import { apiClient } from "../../../utils/apiClient";

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

export default function DosenKelompok({ onNavigate, onLogout }) {
  const { sidebarOpen, openSidebar, closeSidebar } = useSidebar();
  const [groups, setGroups] = useState([]);
  const [toast, setToast] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [nilaiModal, setNilaiModal] = useState(null);
  const [gradeInputs, setGradeInputs] = useState({});
  const [addMemberModal, setAddMemberModal] = useState(null);
  const [createModal, setCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [allStudents, setAllStudents] = useState([]);
  const [mataKuliahList, setMataKuliahList] = useState([]);
  const [selectedMkId, setSelectedMkId] = useState("");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const normalizeGroup = (g) => {
    const members = (g.members || []).map(m =>
      typeof m === 'string' ? { nim: m, name: m, nomorInduk: m } : m
    );
    return { ...g, members, nilai: g.nilai || {} };
  };

  const fetchGroups = async () => {
    try {
      const res = await apiClient.get('/api/kelompok');
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
      const data = await apiClient.get('/api/kelompok/mahasiswa/all');
      if (Array.isArray(data)) {
        setAllStudents(data);
      }
    } catch (error) {
      console.error("Gagal memuat mahasiswa:", error);
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchAllStudents();
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await apiClient.get('/api/mata-kuliah');
      const data = Array.isArray(res) ? res : (res.data || []);
      setMataKuliahList(data);
    } catch (error) {
      console.error("Gagal memuat mata kuliah:", error);
    }
  };

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
      fetchGroups();
    } catch (error) {
      showToast("Gagal mengeluarkan", "error");
    }
  };

  const addMember = async (groupId, nim) => {
    try {
      await apiClient.post(`/api/kelompok/${groupId}/members`, {
        nim: nim
      });
      showToast("Anggota berhasil ditambahkan!");
      fetchGroups();
      setAddMemberModal(null);
    } catch (error) {
      showToast("Gagal menambahkan", "error");
    }
  };

  const createGroup = async () => {
    if (!newGroupName.trim()) {
      showToast("Nama kelompok wajib diisi.", "error");
      return;
    }
    if (!selectedMkId) {
      showToast("Pilih mata kuliah terlebih dahulu.", "error");
      return;
    }
    try {
      await apiClient.post('/api/kelompok', {
        name: newGroupName.trim(),
        idMataKuliah: parseInt(selectedMkId)
      });
      setNewGroupName("");
      setSelectedMkId("");
      setCreateModal(false);
      showToast("Kelompok berhasil dibuat!");
      fetchGroups();
    } catch (error) {
      showToast(error.message || "Gagal membuat kelompok", "error");
    }
  };

  const getMemberColor = (nim) => {
    const idx = allStudents.findIndex(s => s.nim === nim);
    return MEMBER_COLORS[idx >= 0 ? idx % MEMBER_COLORS.length : 0];
  };

  const availableStudents = (groupId) => {
    const inAnyGroup = new Set(groups.flatMap((g) => g.members.map(m => m.nim)));
    return allStudents.filter((s) => !inAnyGroup.has(s.nim));
  };

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
                  <div key={member.nim} className="dk-grade-row">
                    <div className="dk-grade-student">
                      <div
                        className="dk-avatar-sm"
                        style={{ background: getMemberColor(member.nim) }}
                      >
                        {initials(member.name)}
                      </div>
                      <div>
                        <p className="dk-grade-name">{member.name}</p>
                        <p className="dk-grade-nim">{member.nim}</p>
                      </div>
                    </div>
                    <div className="dk-grade-input-wrap">
                      <input
                        className="dk-grade-input"
                        type="number"
                        min={0}
                        max={100}
                        placeholder="0-100"
                        value={gradeInputs[member.nim] ?? ""}
                        onChange={(e) =>
                          setGradeInputs({
                            ...gradeInputs,
                            [member.nim]: e.target.value,
                          })
                        }
                      />
                      <span className="dk-grade-scale">/100</span>
                      {gradeInputs[member.nim] && (
                        <span className="dk-letter-grade">
                          {+gradeInputs[member.nim] >= 85
                            ? "A"
                            : +gradeInputs[member.nim] >= 70
                              ? "B"
                              : +gradeInputs[member.nim] >= 55
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
                  Semua mahasiswa sudah tergabung dalam kelompok.
                </p>
              ) : (
                availableStudents(addMemberModal).map((s) => (
                  <div key={s.nim} className="dk-member-option">
                    <div
                      className="dk-avatar-sm"
                      style={{ background: getMemberColor(s.nim) }}
                    >
                      {initials(s.name)}
                    </div>
                    <div className="dk-member-info">
                      <p className="dk-member-name">{s.name}</p>
                      <p className="dk-member-nim">{s.nim}</p>
                    </div>
                    <button
                      className="dk-btn-add-member"
                      onClick={() => addMember(addMemberModal, s.nim)}
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
                <label className="dk-label">Mata Kuliah</label>
                <select
                  className="dk-input"
                  value={selectedMkId}
                  onChange={(e) => setSelectedMkId(e.target.value)}
                >
                  <option value="">— Pilih Mata Kuliah —</option>
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

      <SidebarDosen
        onNavigate={onNavigate}
        onLogout={onLogout}
        activePage="dosenKelompok"
        mobileOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      <main
        className="page-main"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        <Navbar
          role="Dosen"
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
              <p className="dk-page-sub">
                Kelola anggota kelompok, pantau progress, dan berikan penilaian.
              </p>
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
                value: groups.length,
                icon: "groups",
                color: "var(--color-secondary)",
              },
              {
                label: "On-Track",
                value: groups.filter((g) => g.status === "On-Track").length,
                icon: "trending_up",
                color: "#2f9696",
              },
              {
                label: "Terlambat",
                value: groups.filter((g) => g.status === "Behind").length,
                icon: "warning",
                color: "#dc2626",
              },
              {
                label: "Selesai",
                value: groups.filter((g) => g.status === "Completed").length,
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
            {groups.map((group) => {
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
                    <span
                      className="dk-progress-status"
                      style={{
                        color: statusColor(group.status),
                        background: statusBg(group.status),
                      }}
                    >
                      {group.status}
                    </span>
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
                        const nilai = group.nilai[member.nim];
                        return (
                          <div key={member.nim} className="dk-member-row">
                            <div
                              className="dk-avatar-sm"
                              style={{ background: getMemberColor(member.nim) }}
                            >
                              {initials(member.name)}
                            </div>
                            <div className="dk-member-info">
                              <p className="dk-member-name">{member.name}</p>
                              <p className="dk-member-nim">{member.nim}</p>
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
                                onClick={() => removeMember(group.id, member.nim)}
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
                      <span
                        className={group.submitted ? "dk-sub-yes" : "dk-sub-no"}
                      >
                        {group.submitted
                          ? "Sudah Dikumpulkan"
                          : "Belum Dikumpulkan"}
                      </span>
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
