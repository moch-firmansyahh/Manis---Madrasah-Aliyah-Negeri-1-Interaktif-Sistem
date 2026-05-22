import logoImg from "../assets/logo.png";
import "./shared.css";

export default function SidebarGuru({
  onNavigate,
  activePage,
  onLogout,
  mobileOpen,
  onClose,
}) {
  function nav(page) {
    if (onNavigate) onNavigate(page);
    if (onClose) onClose();
  }

  function isActive(key) {
    return activePage === key;
  }

  function cls(key) {
    return "sidebar__link" + (isActive(key) ? " is-active" : "");
  }

  return (
    <>
      {mobileOpen && <div className="sidebar-backdrop" onClick={onClose} />}

      <aside className={`sidebar${mobileOpen ? " sidebar--mobile-open" : ""}`}>
        <button
          className="sidebar__mobile-close"
          onClick={onClose}
          aria-label="Tutup menu"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="sidebar__brand">
          <div className="sidebar__logo" style={{ background: 'transparent', boxShadow: 'none', width: 'auto', height: 'auto' }}>
            <img src={logoImg} alt="Manis" style={{ width: '52px', height: '52px', objectFit: 'contain' }} />
          </div>
          <div>
            <p className="sidebar__app-name">Manis</p>
            <p className="sidebar__app-sub">Madrasah Aliyah Negeri 1 Interaktif Sistem</p>
          </div>
        </div>

        <nav className="sidebar__nav">
          <button
            className={cls("guruDashboard")}
            onClick={() => nav("guruDashboard")}
          >
            <span className="material-symbols-outlined">dashboard</span>
            Beranda
          </button>
          <button
            className={cls("guruPresensi")}
            onClick={() => nav("guruPresensi")}
          >
            <span className="material-symbols-outlined">qr_code_2</span>
            Presensi & QR
          </button>
          <button
            className={cls("guruMateri")}
            onClick={() => nav("guruMateri")}
          >
            <span className="material-symbols-outlined">menu_book</span>
            Materi
          </button>
          <button
            className={cls("guruTugas")}
            onClick={() => nav("guruTugas")}
          >
            <span className="material-symbols-outlined">assignment</span>
            Tugas
          </button>
          <button
            className={cls("guruKelompok")}
            onClick={() => nav("guruKelompok")}
          >
            <span className="material-symbols-outlined">groups</span>
            Kelompok
          </button>
          <button
            className={cls("guruNilaiIndividu")}
            onClick={() => nav("guruNilaiIndividu")}
          >
            <span className="material-symbols-outlined">assignment_ind</span>
            Nilai Individu
          </button>
          <button
            className={cls("guruForum")}
            onClick={() => nav("guruForum")}
          >
            <span className="material-symbols-outlined">forum</span>
            Diskusi
          </button>
          <button
            className={cls("guruProfile")}
            onClick={() => nav("guruProfile")}
          >
            <span className="material-symbols-outlined">account_circle</span>
            Profil
          </button>
        </nav>

        <div className="sidebar__footer">
          <button
            className="sidebar__logout-btn"
            onClick={() => {
              if (onLogout) onLogout();
            }}
          >
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
