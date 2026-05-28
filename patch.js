const fs = require('fs');
const path = require('path');

function patchTugas() {
  const file = 'frontend/src/pages/guru/guruTugas/guruTugas.jsx';
  let content = fs.readFileSync(file, 'utf-8');
  
  content = content.replace(
    'import { apiClient, API_URL } from "../../../utils/apiClient";',
    'import ClassSelector from "../../../components/ClassSelector";\nimport { apiClient, API_URL } from "../../../utils/apiClient";'
  );
  
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
              </p>
              <button onClick={() => setSelectedClass(null)} className="dm-btn-cancel" style={{ marginTop: '0.5rem', padding: '4px 8px', fontSize: '0.8rem' }}>
                Ganti Kelas
              </button>`
  );
  
  content = content.replace(
    '        </div>\n      </main>\n    </div>\n  );\n}',
    '        </div>\n        )}\n      </main>\n    </div>\n  );\n}'
  );
  
  fs.writeFileSync(file, content, 'utf-8');
}

function patchMateri() {
  const file = 'frontend/src/pages/guru/guruMateri/guruMateri.jsx';
  let content = fs.readFileSync(file, 'utf-8');
  
  content = content.replace(
    'import { apiClient, API_URL } from "../../../utils/apiClient";',
    'import ClassSelector from "../../../components/ClassSelector";\nimport { apiClient, API_URL } from "../../../utils/apiClient";'
  );
  
  content = content.replace(
    'const [matkulList, setMatkulList] = useState([]);',
    'const [matkulList, setMatkulList] = useState([]);\n  const [selectedClass, setSelectedClass] = useState(null);'
  );
  
  content = content.replace(
    'const mapped = data.map((mk) => ({',
    'const filteredData = selectedClass ? data.filter(mk => mk.kelas && mk.kelas.idKelas === selectedClass.idKelas) : data;\n        const mapped = filteredData.map((mk) => ({'
  );

  content = content.replace(
    'useEffect(() => {\n    fetchMatkulList();\n    fetchMateri();\n  }, []);',
    'useEffect(() => {\n    if (selectedClass) {\n      fetchMatkulList();\n      fetchMateri();\n    }\n  }, [selectedClass]);'
  );

  content = content.replace(
    '<div className="page-content">\n          {/* ═══════════════ LIST VIEW ═══════════════ */}\n          {view === "list" && (\n            <>\n              <div className="dm-topbar">',
    `{!selectedClass ? (
          <ClassSelector 
            onSelectClass={(cls) => setSelectedClass(cls)} 
            onCancel={() => {
              if (onNavigate) onNavigate("guruDashboard");
            }} 
          />
        ) : (
        <div className="page-content">
          {/* ═══════════════ LIST VIEW ═══════════════ */}
          {view === "list" && (
            <>
              <div className="dm-topbar">`
  );
  
  content = content.replace(
    '              <p className="dm-page-sub">\n                Kelola semua materi yang telah Anda unggah untuk siswa.\n              </p>',
    `              <p className="dm-page-sub">
                Kelas: <strong>{selectedClass.namaKelas}</strong>
              </p>
              <button onClick={() => setSelectedClass(null)} className="dm-btn-cancel" style={{ marginTop: '0.5rem', padding: '4px 8px', fontSize: '0.8rem' }}>
                Ganti Kelas
              </button>`
  );
  
  content = content.replace(
    '        </div>\n      </main>\n    </div>\n  );\n}',
    '        </div>\n        )}\n      </main>\n    </div>\n  );\n}'
  );
  
  fs.writeFileSync(file, content, 'utf-8');
}

function patchPresensi() {
  const file = 'frontend/src/pages/guru/guruPresensi/guruPresensi.jsx';
  let content = fs.readFileSync(file, 'utf-8');
  
  content = content.replace(
    'import { apiClient } from "../../../utils/apiClient";',
    'import ClassSelector from "../../../components/ClassSelector";\nimport { apiClient } from "../../../utils/apiClient";'
  );
  
  content = content.replace(
    'const [page, setPage] = useState(1);',
    'const [page, setPage] = useState(1);\n  const [selectedClass, setSelectedClass] = useState(null);'
  );
  
  content = content.replace(
    'const formatted = data.map((c) => ({',
    'const filteredData = selectedClass ? data.filter(mk => mk.kelas && mk.kelas.idKelas === selectedClass.idKelas) : data;\n        const formatted = filteredData.map((c) => ({'
  );
  
  content = content.replace(
    'fetchCourses();\n  }, []);',
    'if (selectedClass) {\n      fetchCourses();\n    }\n  }, [selectedClass]);'
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
          <div className="dp-topbar">`
  );
  
  content = content.replace(
    '              <h2 className="dp-page-title">Manajemen Presensi</h2>\n              <p className="dp-page-sub">\n                Hasilkan QR Code presensi dan pantau kehadiran siswa secara\n                real-time.\n              </p>',
    `              <h2 className="dp-page-title">Presensi Kelas</h2>
              <p className="dp-page-sub">
                Kelas: <strong>{selectedClass.namaKelas}</strong>
              </p>
              <button onClick={() => setSelectedClass(null)} className="dp-btn-cancel" style={{ marginTop: '0.5rem', padding: '4px 8px', fontSize: '0.8rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                Ganti Kelas
              </button>`
  );
  
  content = content.replace(
    '        </div>\n      </main>\n    </div>\n  );\n}',
    '        </div>\n        )}\n      </main>\n    </div>\n  );\n}'
  );
  
  fs.writeFileSync(file, content, 'utf-8');
}

try {
  patchTugas();
  console.log('patched tugas');
  patchMateri();
  console.log('patched materi');
  patchPresensi();
  console.log('patched presensi');
} catch (e) {
  console.error(e);
}
