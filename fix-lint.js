const fs = require('fs');

function fixTugas() {
  const file = 'frontend/src/pages/guru/guruTugas/guruTugas.jsx';
  let content = fs.readFileSync(file, 'utf-8');
  
  if (!content.includes('const nav = (page)')) {
    content = content.replace(
      'const showToast =',
      'const nav = (page) => { if (onNavigate) onNavigate(page); };\n  const showToast ='
    );
  }
  
  // Also fix the unapplied ClassSelector from patch.js
  if (!content.includes('<ClassSelector')) {
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
  }

  fs.writeFileSync(file, content, 'utf-8');
}

function fixPresensi() {
  const file = 'frontend/src/pages/guru/guruPresensi/guruPresensi.jsx';
  let content = fs.readFileSync(file, 'utf-8');
  
  if (!content.includes('const nav = (page)')) {
    content = content.replace(
      'const showToast =',
      'const nav = (page) => { if (onNavigate) onNavigate(page); };\n  const showToast ='
    );
  }

  // Move handleRefresh above useEffect
  const hrMatch = content.match(/const handleRefresh = useCallback\(\(\) => \{[\s\S]*?\}, \[\]\);/);
  if (hrMatch) {
    const hr = hrMatch[0];
    content = content.replace(hr, '');
    content = content.replace(
      'useEffect(() => {\n    if (timeLeft <= 0) handleRefresh();',
      hr + '\n\n  useEffect(() => {\n    if (timeLeft <= 0) handleRefresh();'
    );
  }
  
  // Fix the unapplied ClassSelector
  if (!content.includes('<ClassSelector')) {
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
  }

  fs.writeFileSync(file, content, 'utf-8');
}

function fixMateri() {
  const file = 'frontend/src/pages/guru/guruMateri/guruMateri.jsx';
  let content = fs.readFileSync(file, 'utf-8');
  
  if (!content.includes('const nav = (page)')) {
    content = content.replace(
      'const showToast =',
      'const nav = (page) => { if (onNavigate) onNavigate(page); };\n  const showToast ='
    );
  }

  // Fix the unapplied ClassSelector
  if (!content.includes('<ClassSelector')) {
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
  }

  fs.writeFileSync(file, content, 'utf-8');
}

try {
  fixTugas();
  console.log('fixed tugas');
  fixPresensi();
  console.log('fixed presensi');
  fixMateri();
  console.log('fixed materi');
} catch (e) {
  console.error(e);
}
