const fs = require('fs');
const path = require('path');

function removeLine(filePath, regex) {
  const fullPath = path.resolve(__dirname, filePath);
  if (!fs.existsSync(fullPath)) return;
  let content = fs.readFileSync(fullPath, 'utf8');
  content = content.replace(regex, '');
  fs.writeFileSync(fullPath, content);
}

removeLine('frontend/src/pages/siswa/mataKuliah/mataKuliah.jsx', /import "\.\/videoMataKuliah\.css";\n?/g);
removeLine('frontend/src/components/Navbar.jsx', /import "\.\.\/pages\/siswa\/dashboard\/notifikasi\.css";\n?/g);
removeLine('frontend/src/pages/siswa/dashboard/dashboard.jsx', /import "\.\/notifikasi\.css";\n?/g);

console.log('Done removing css imports');
