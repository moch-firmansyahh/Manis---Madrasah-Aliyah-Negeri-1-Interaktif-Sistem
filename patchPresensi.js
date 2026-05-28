const fs = require('fs');

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
    'const showToast =',
    'const nav = (page) => { if (onNavigate) onNavigate(page); };\n  const showToast ='
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
  patchPresensi();
  console.log('patched presensi successfully');
} catch (e) {
  console.error(e);
}
