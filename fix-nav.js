const fs = require('fs');

const files = [
  'frontend/src/pages/guru/guruTugas/guruTugas.jsx',
  'frontend/src/pages/guru/guruMateri/guruMateri.jsx',
  'frontend/src/pages/guru/guruPresensi/guruPresensi.jsx'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/if \(nav\) nav\("\/guru\/dashboard"\);/g, 'if (onNavigate) onNavigate("guruDashboard");');
  fs.writeFileSync(f, content);
});

let presensi = fs.readFileSync('frontend/src/pages/guru/guruPresensi/guruPresensi.jsx', 'utf8');
const search = `  useEffect(() => {
    if (timeLeft <= 0) handleRefresh();
  }, [timeLeft]);

  const handleRefresh = useCallback(() => {
    setQrLoaded(false);
    setToken("");
    setTimeLeft(QR_TTL);
    showToast("QR Code diperbarui!");
  }, []);`;
const replacement = `  const handleRefresh = useCallback(() => {
    setQrLoaded(false);
    setToken("");
    setTimeLeft(QR_TTL);
    showToast("QR Code diperbarui!");
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) handleRefresh();
  }, [timeLeft, handleRefresh]);`;

presensi = presensi.replace(search, replacement);
fs.writeFileSync('frontend/src/pages/guru/guruPresensi/guruPresensi.jsx', presensi);
console.log('done');
