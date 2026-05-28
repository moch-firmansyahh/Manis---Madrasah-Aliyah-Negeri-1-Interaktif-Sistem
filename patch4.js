const fs = require('fs');

function patch(file, replacer) {
  let content = fs.readFileSync(file, 'utf8');
  content = replacer(content);
  fs.writeFileSync(file, content);
}

// 1. guruMateri
patch('frontend/src/pages/guru/guruMateri/guruMateri.jsx', (content) => {
  if (!content.includes('import ClassSelector')) {
    content = content.replace('import { apiClient } from "../../../utils/apiClient";', 'import { apiClient } from "../../../utils/apiClient";\nimport ClassSelector from "../../../components/ClassSelector";');
  }
  content = content.replace(
    'const [matkulList, setMatkulList] = useState([]);',
    'const [matkulList, setMatkulList] = useState([]);\n  const [selectedClass, setSelectedClass] = useState(null);'
  );
  content = content.replace(
    'const mapped = data.map((mk) => ({',
    'const filteredData = selectedClass ? data.filter(mk => mk.kelas && mk.kelas.idKelas === selectedClass.idKelas) : data;\n        const mapped = filteredData.map((mk) => ({'
  );
  content = content.replace(
    'useEffect(() => {\n    fetchMatkulList();\n    fetchMateri("Semua", "Semua");\n  }, []);',
    'useEffect(() => {\n    if (selectedClass) {\n      fetchMatkulList();\n      fetchMateri("Semua", "Semua");\n    }\n  }, [selectedClass]);'
  );
  
  // Render injection
  content = content.replace(
    '<div className="page-content">\n          {/* ═══════════════ LIST VIEW ═══════════════ */}',
    `{!selectedClass ? (
          <ClassSelector 
            onSelectClass={(cls) => setSelectedClass(cls)} 
            onCancel={() => {
              if (onNavigate) onNavigate("guruDashboard");
            }} 
          />
        ) : (
        <div className="page-content">
          {/* ═══════════════ LIST VIEW ═══════════════ */}`
  );
  
  content = content.replace(
    'Kelola modul ajar, dokumen, video, dan tautan materi untuk\n                    siswa Anda.',
    'Kelas: <strong>{selectedClass.namaKelas}</strong>'
  );
  
  const oldBtn = `<button className="dm-btn-primary" onClick={startCreate}>
                  <span className="material-symbols-outlined">add</span>
                  Tambah Materi
                </button>`;
  const newBtn = `<div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <button onClick={() => setSelectedClass(null)} className="dm-btn-cancel" style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
                    Ganti Kelas
                  </button>
                  <button className="dm-btn-primary" onClick={startCreate}>
                    <span className="material-symbols-outlined">add</span>
                    Tambah Materi
                  </button>
                </div>`;
  content = content.replace(oldBtn, newBtn);
  
  // End of file closing
  content = content.replace(
    '        </div>\n      </main>\n    </div>\n  );\n}',
    '        </div>\n        )}\n      </main>\n    </div>\n  );\n}'
  );
  return content;
});

// 2. guruTugas
patch('frontend/src/pages/guru/guruTugas/guruTugas.jsx', (content) => {
  if (!content.includes('import ClassSelector')) {
    content = content.replace('import { apiClient } from "../../../utils/apiClient";', 'import { apiClient } from "../../../utils/apiClient";\nimport ClassSelector from "../../../components/ClassSelector";');
  }
  content = content.replace(
    'const [filter, setFilter] = useState("Semua");',
    'const [filter, setFilter] = useState("Semua");\n  const [selectedClass, setSelectedClass] = useState(null);'
  );
  content = content.replace(
    'const mapped = data.map(mk => ({ id: mk.idMataKuliah, name: mk.namaMataKuliah }));',
    'const filteredData = selectedClass ? data.filter(mk => mk.kelas && mk.kelas.idKelas === selectedClass.idKelas) : data;\n      const mapped = filteredData.map(mk => ({ id: mk.idMataKuliah, name: mk.namaMataKuliah }));'
  );
  content = content.replace(
    'useEffect(() => {\n    fetchMatkulList();\n    fetchTasks();\n  }, []);',
    'useEffect(() => {\n    if (selectedClass) {\n      fetchMatkulList();\n      fetchTasks();\n    }\n  }, [selectedClass]);'
  );
  
  content = content.replace(
    '<div className="page-content">\n          {/* Top bar */}\n          <div className="dt-topbar">',
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
          <div className="dt-topbar">`
  );
  
  content = content.replace(
    '              <p className="dt-page-sub">\n                {view === "list"\n                  ? "Kelola semua tugas yang Anda berikan kepada siswa."\n                  : view === "create"\n                    ? "Isi detail tugas yang akan diberikan kepada siswa."\n                    : "Perbarui informasi tugas yang sudah ada."}\n              </p>',
    `              <p className="dt-page-sub">
                Kelas: <strong>{selectedClass.namaKelas}</strong>
              </p>`
  );

  const oldBtnT = `{view === "list" && (
              <button className="dt-btn-primary" onClick={startForm}>
                <span className="material-symbols-outlined">add</span>
                Buat Tugas Baru
              </button>
            )}`;
  const newBtnT = `<div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button onClick={() => setSelectedClass(null)} className="dm-btn-cancel" style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
                Ganti Kelas
              </button>
              {view === "list" && (
                <button className="dt-btn-primary" onClick={startForm}>
                  <span className="material-symbols-outlined">add</span>
                  Buat Tugas Baru
                </button>
              )}
            </div>`;
  content = content.replace(oldBtnT, newBtnT);

  content = content.replace(
    '        </div>\n      </main>\n    </div>\n  );\n}',
    '        </div>\n        )}\n      </main>\n    </div>\n  );\n}'
  );
  return content;
});

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

  content = content.replace(
    '        </div>\n      </main>\n    </div>\n  );\n}',
    '        </div>\n        )}\n      </main>\n    </div>\n  );\n}'
  );
  return content;
});

console.log('Patch complete.');
