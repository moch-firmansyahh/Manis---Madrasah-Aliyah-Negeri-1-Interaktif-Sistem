import React, { useState, useEffect } from "react";
import { apiClient } from "../utils/apiClient";
import "./ClassSelector.css"; // We'll create this or use inline/shared classes

const ClassSelector = ({ onSelectClass, onCancel }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        // We get the list of MataKuliah for this teacher, and extract unique classes
        const res = await apiClient.get("/api/mata-kuliah");
        const matkulList = Array.isArray(res) ? res : (res?.data?.data || res?.data || []);
        
        // Extract unique classes
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

  if (loading) {
    return (
      <div className="class-selector-overlay">
        <div className="class-selector-modal">
          <h2>Memuat Kelas...</h2>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="class-selector-overlay">
        <div className="class-selector-modal">
          <h2>Terjadi Kesalahan</h2>
          <p>{error}</p>
          {onCancel && <button onClick={onCancel} className="dp-btn-danger">Kembali</button>}
        </div>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="class-selector-overlay">
        <div className="class-selector-modal">
          <h2>Belum Ada Kelas</h2>
          <p>Anda belum ditugaskan untuk mengajar di kelas manapun.</p>
          {onCancel && <button onClick={onCancel} className="dp-btn-danger">Kembali</button>}
        </div>
      </div>
    );
  }

  return (
    <div className="class-selector-overlay">
      <div className="class-selector-modal">
        <div className="class-selector-header">
          <h2>Pilih Kelas</h2>
          <p>Silakan pilih kelas terlebih dahulu sebelum melanjutkan.</p>
        </div>
        
        <div className="class-grid">
          {classes.map((cls) => (
            <div 
              key={cls.idKelas} 
              className="class-card"
              onClick={() => onSelectClass(cls)}
            >
              <div className="class-icon">
                <span className="material-symbols-outlined">school</span>
              </div>
              <div className="class-info">
                <h3>{cls.namaKelas}</h3>
                <span className="class-badge">Tingkat {cls.tingkat}</span>
              </div>
            </div>
          ))}
        </div>
        
        {onCancel && (
          <div className="class-selector-footer">
            <button onClick={onCancel} className="btn-secondary">
              Batal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassSelector;
