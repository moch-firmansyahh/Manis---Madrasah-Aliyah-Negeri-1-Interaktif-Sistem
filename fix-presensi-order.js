const fs = require('fs');
let presensi = fs.readFileSync('frontend/src/pages/guru/guruPresensi/guruPresensi.jsx', 'utf8');

const s1 = `  useEffect(() => {
    if (!sessionActive || timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft, sessionActive]);

  useEffect(() => {
    if (timeLeft <= 0) handleRefresh();
  }, [timeLeft]);

  const handleRefresh = useCallback(() => {
    setQrLoaded(false);
    setToken("");
    setTimeLeft(QR_TTL);
    showToast("QR Code diperbarui!");
  }, []);`;

const r1 = `  useEffect(() => {
    if (!sessionActive || timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft, sessionActive]);

  const handleRefresh = useCallback(() => {
    setQrLoaded(false);
    setToken("");
    setTimeLeft(QR_TTL);
    showToast("QR Code diperbarui!");
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) handleRefresh();
  }, [timeLeft, handleRefresh]);`;

presensi = presensi.replace(s1, r1);
fs.writeFileSync('frontend/src/pages/guru/guruPresensi/guruPresensi.jsx', presensi);
console.log('Fixed order');
