import React, { useState, useEffect } from "react";
import { apiClient } from "../utils/apiClient";
import "./ClassSelector.css";

const ClassSelector = ({ onSelectClass, onCancel }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        
        setClasses(Array.from(uniqueClassesMap.values()));
      } catch (err) {
        console.error("Gagal memuat kelas:", err);
        setError("Gagal memuat data kelas.");
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

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
      <div className="cs-grid">
        {classes.map((cls, idx) => (
          <div 
            key={cls.idKelas} 
            className="cs-card"
            style={{ animationDelay: `${idx * 0.05}s` }}
            onClick={() => onSelectClass(cls)}
          >
            <div className="cs-card-bg-blob"></div>
            <div className="cs-card-content">
              <div className="cs-card-icon-wrapper">
                <span className="material-symbols-outlined cs-card-icon">meeting_room</span>
              </div>
              <div className="cs-card-text">
                <h3>{cls.namaKelas}</h3>
                <span className="cs-badge">Tingkat {cls.tingkat}</span>
              </div>
              <div className="cs-card-arrow">
                <span className="material-symbols-outlined">arrow_forward</span>
              </div>
            </div>
          </div>
        ))}
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
        
        <div className="cs-header">
          <div className="cs-header-icon-box">
            <span className="material-symbols-outlined">auto_awesome_mosaic</span>
          </div>
          <h2>Pilih Kelas</h2>
          <p>Tentukan ruang lingkup kelas sebelum mengakses fitur utama.</p>
        </div>
        
        <div className="cs-body">
          {renderContent()}
        </div>
        
        {onCancel && (
          <div className="cs-footer">
            <button onClick={onCancel} className="cs-btn-cancel">
              <span className="material-symbols-outlined">arrow_back</span>
              Kembali ke Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassSelector;
