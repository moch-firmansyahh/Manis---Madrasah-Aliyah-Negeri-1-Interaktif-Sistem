const fs = require('fs');

function fix(file) {
  let content = fs.readFileSync(file, 'utf8');

  // Fix duplicate useState
  content = content.replace(
    /const \[selectedClass, setSelectedClass\] = useState\(null\);\s*const \[selectedClass, setSelectedClass\] = useState\(null\);/g,
    'const [selectedClass, setSelectedClass] = useState(null);'
  );

  // Fix hanging `)}` in guruMateri
  // At the end of guruMateri, we did:
  // content.replace('        </div>\n      </main>\n    </div>', '        </div>\n        )}\n      </main>\n    </div>');
  // Wait, if it already had it, or if there's an extra `}`?
  // Let's check guruMateri.jsx around line 619 to 870 to see the end of render
  
  fs.writeFileSync(file, content);
}

fix('frontend/src/pages/guru/guruMateri/guruMateri.jsx');
fix('frontend/src/pages/guru/guruTugas/guruTugas.jsx');
fix('frontend/src/pages/guru/guruPresensi/guruPresensi.jsx');
