const fs = require('fs');

function patch(file, replacer) {
  let content = fs.readFileSync(file, 'utf8');
  content = replacer(content);
  fs.writeFileSync(file, content);
}

// 3. guruPresensi
patch('frontend/src/pages/guru/guruPresensi/guruPresensi.jsx', (content) => {
  if (!content.includes('import ClassSelector')) {
    content = content.replace('import { apiClient } from "../../../utils/apiClient";', 'import { apiClient } from "../../../utils/apiClient";\nimport ClassSelector from "../../../components/ClassSelector";');
  }
  content = content.replace(
    'const [page, setPage] = useState(1);',
    'const [page, setPage] = useState(1);\n  const [selectedClass, setSelectedClass] = useState(null);'
  );
  content = content.replace(
    'const formatted = data.map((c) => ({',
    'const filteredData = selectedClass ? data.filter(mk => mk.kelas && mk.kelas.idKelas === selectedClass.idKelas) : data;\n        const formatted = filteredData.map((c) => ({'
  );
  content = content.replace(
    '    fetchCourses();\n  }, []);',
    '    if (selectedClass) {\n      fetchCourses();\n    }\n  }, [selectedClass]);'
  );
  
  content = content.replace(
    '<div className="page-content">\n          {/* Top bar */}\n          <div className="dp-topbar">',
    `{!selectedClass ? (
          <ClassSelector 
            onSelectClass={(cls) => setSelectedClass(cls)} 
            onCancel={() => {
              if (onNavigate) onNavigate("guruDashboard");
            }} 
          />
        ) : (
        <div className="page-content">
          {/* Top bar */}
          <div className="dp-topbar">`
  );
  
  content = content.replace(
    '              <h2 className="dp-page-title">Manajemen Presensi</h2>\n              <p className="dp-page-sub">\n                Hasilkan QR Code presensi dan pantau kehadiran siswa secara\n                real-time.\n              </p>',
    `              <h2 className="dp-page-title">Presensi Kelas</h2>
              <p className="dp-page-sub">
                Kelas: <strong>{selectedClass.namaKelas}</strong>
              </p>`
  );

  content = content.replace(
    '<div className="dp-top-actions" style={{ position: "relative" }}>',
    `<button onClick={() => setSelectedClass(null)} className="dp-btn-cancel" style={{ padding: '8px 12px', fontSize: '0.85rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', height: 'fit-content', marginTop: '16px' }}>
              Ganti Kelas
            </button>
            <div className="dp-top-actions" style={{ position: "relative" }}>`
  );

  // IMPLEMENT TUTUP SESI DEFAULT LOGIC
  
  // 1. Remove setSessionActive(true) from date picker
  content = content.replace(
    'setShowJadwal(false);\n                        setSessionActive(true);\n                        try {',
    'setShowJadwal(false);\n                        try {'
  );

  // 2. Change the Buka/Tutup Sesi buttons
  const oldBtnLogic = `{sessionActive ? (
                <button className="dp-btn-danger" onClick={endSession}>
                  <span className="material-symbols-outlined">stop_circle</span>
                  Tutup Sesi
                </button>
              ) : (
                <button
                  className="dp-btn-primary"
                  onClick={async () => {`;
                  
  const newBtnLogic = `{sessionActive ? (
                <button className="dp-btn-danger" onClick={endSession}>
                  <span className="material-symbols-outlined">stop_circle</span>
                  Tutup Sesi
                </button>
              ) : token ? (
                <button className="dp-btn-primary" onClick={() => {
                  setSessionActive(true);
                  // Optional: add a tiny toast here if there's a showToast fn available in scope
                }}>
                  <span className="material-symbols-outlined">play_circle</span>
                  Buka Sesi
                </button>
              ) : (
                <button
                  className="dp-btn-primary"
                  onClick={async () => {`;
  content = content.replace(oldBtnLogic, newBtnLogic);
  
  // 3. Instead of setting sessionActive(true) after generating the session, do NOT set it.
  content = content.replace('setSessionActive(true);\n                      // Tambahkan tanggal hari ini', '// Tambahkan tanggal hari ini');
  content = content.replace('setSessionActive(true);\n                        // Generate new token', '// Generate new token');
  
  // 4. Change the text from "Buka Sesi" (in the generate button) to "Buat Sesi"
  content = content.replace(
    '                  <span className="material-symbols-outlined">play_circle</span>\n                  Buka Sesi\n                </button>\n              )}',
    '                  <span className="material-symbols-outlined">add_circle</span>\n                  Buat Sesi\n                </button>\n              )}'
  );

  // 5. Add closing tags
  content = content.replace(
    '        </div>\n      </main>\n    </div>\n  );\n}',
    '        </div>\n        )}\n      </main>\n    </div>\n  );\n}'
  );
  return content;
});

console.log('Patch presensi complete.');
