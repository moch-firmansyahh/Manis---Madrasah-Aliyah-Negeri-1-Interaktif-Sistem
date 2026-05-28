const fs = require('fs');

const files = [
  'frontend/src/pages/guru/guruTugas/guruTugas.jsx',
  'frontend/src/pages/guru/guruMateri/guruMateri.jsx',
  'frontend/src/pages/guru/guruPresensi/guruPresensi.jsx'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/typeof nav !== "undefined"[\s\S]*?\? onNavigate[\s\S]*?: undefined/g, 'onNavigate');
  fs.writeFileSync(f, content);
});
console.log('done');
