import React, { useState, useEffect } from "react";
import { apiClient } from "../utils/apiClient";
import "./ClassSelector.css";

const ClassSelector = ({ onSelectClass, onCancel }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [activeTingkat, setActiveTingkat] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get("/api/mata-kuliah");
        const matkulList = Array.isArray(res) ? res : (res?.data?.data || res?.data || []);
        
        const uniqueClassesMap = new Map();
        matkulList.forEach((mk) => {
          if (mk.kelas && mk.kelas.idKelas) {
            if (!uniqueClassesMap.has(mk.kelas.idKelas)) {
              uniqueClassesMap.set(mk.kelas.idKelas, mk.kelas);
            }
          }
        });
        
        const uniqueClasses = Array.from(uniqueClassesMap.values());
        setClasses(uniqueClasses);
        
        // Auto select first available tingkat
        if (uniqueClasses.length > 0) {
          const uniqueTingkat = Array.from(new Set(uniqueClasses.map(c => c.tingkat))).sort((a, b) => a - b);
          if (uniqueTingkat.length > 0) {
            setActiveTingkat(uniqueTingkat[0]);
          }
        }
      } catch (err) {
        console.error("Gagal memuat kelas:", err);
        setError("Gagal memuat data kelas.");
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const handleConfirm = () => {
    if (selectedClass) {
      onSelectClass(selectedClass);
    }
  };

  const uniqueTingkatList = Array.from(new Set(classes.map(c => c.tingkat))).sort((a, b) => a - b);

  const filteredClasses = classes.filter(cls => {
    const matchesTingkat = Number(cls.tingkat) === Number(activeTingkat);
    const matchesSearch = cls.namaKelas.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTingkat && matchesSearch;
  });

  const renderContent = () => {
    if (loading) {
      return (
        <div className="cs-state-box">
          <div className="cs-spinner"></div>
          <p>Memuat daftar kelas...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="cs-state-box cs-error">
          <span className="material-symbols-outlined cs-error-icon">error</span>
          <p>{error}</p>
        </div>
      );
    }

    if (classes.length === 0) {
      return (
        <div className="cs-state-box cs-empty">
          <span className="material-symbols-outlined cs-empty-icon">school</span>
          <p>Anda belum ditugaskan untuk mengajar di kelas manapun.</p>
        </div>
      );
    }

    return (
      <div className="cs-layout-container">
        {/* Left Sidebar */}
        <div className="cs-sidebar">
          {uniqueTingkatList.map((tingkat) => {
            const isActive = Number(tingkat) === Number(activeTingkat);
            return (
              <button
                key={tingkat}
                className={`cs-sidebar-item ${isActive ? "active" : ""}`}
                onClick={() => {
                  setActiveTingkat(tingkat);
                  setSelectedClass(null); // Clear selection when switching tab
                }}
              >
                <div className={`cs-sidebar-badge ${isActive ? "active" : ""}`}>
                  <span className="cs-sidebar-badge-top">Tingkat</span>
                  <span className="cs-sidebar-badge-bottom">{tingkat}</span>
                </div>
                <span className="cs-sidebar-text">Tingkat {tingkat}</span>
              </button>
            );
          })}
        </div>

        {/* Right Main Content */}
        <div className="cs-main-content">
          <div className="cs-content-header">
            <h3>Tingkat {activeTingkat}</h3>
            <div className="cs-search-wrapper">
              <span className="material-symbols-outlined cs-search-icon">search</span>
              <input
                type="text"
                placeholder="Cari kelas..."
                className="cs-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="cs-grid-container">
            {filteredClasses.length > 0 ? (
              <div className="cs-classes-grid">
                {filteredClasses.map((cls) => {
                  const isSelected = selectedClass?.idKelas === cls.idKelas;
                  return (
                    <div
                      key={cls.idKelas}
                      className={`cs-class-card ${isSelected ? "selected" : ""}`}
                      onClick={() => setSelectedClass(cls)}
                    >
                      <div className="cs-class-icon-wrapper">
                        <span className="material-symbols-outlined">group</span>
                      </div>
                      <div className="cs-class-info">
                        <h4>{cls.namaKelas}</h4>
                        <div className="cs-class-tags">
                          <span className="cs-class-tag tag-tingkat">
                            TINGKAT {cls.tingkat}
                          </span>
                          <span className="cs-class-tag tag-status">
                            Aktif
                          </span>
                        </div>
                      </div>
                      <div className="cs-class-action">
                        <span className="material-symbols-outlined">chevron_right</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="cs-no-results">
                <span className="material-symbols-outlined">search_off</span>
                <p>Tidak ada kelas yang cocok</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="cs-overlay">
      <div className="cs-modal">
        {onCancel && (
          <button className="cs-close-btn" onClick={onCancel} title="Batal">
            <span className="material-symbols-outlined">close</span>
          </button>
        )}
        
        <div className="cs-modal-header">
          <h2>Pilih Lingkup Kelas Anda</h2>
          <p>Silakan tentukan tingkat dan kelas yang ingin Anda kelola.</p>
        </div>
        
        <div className="cs-modal-body">
          {renderContent()}
        </div>
        
        <div className="cs-modal-footer">
          <div className="cs-footer-left">
            {onCancel && (
              <button onClick={onCancel} className="cs-btn-cancel">
                <span className="material-symbols-outlined">arrow_back</span>
                Kembali ke Dashboard
              </button>
            )}
          </div>
          <div className="cs-footer-right">
            <button 
              onClick={handleConfirm} 
              className="cs-btn-confirm"
              disabled={!selectedClass}
            >
              Konfirmasi Pilihan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassSelector;
