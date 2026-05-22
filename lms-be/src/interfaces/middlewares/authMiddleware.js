import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Akses ditolak, token tidak ada" });
  }

  const token = authHeader.split(' ')[1];

  try {
    // JWT_SECRET harus ada di environment - tidak boleh fallback
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET environment variable not configured");
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Simpan data user yang login ke dalam object request
    req.user = decoded; 
    next(); // Lanjut ke route berikutnya
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: "Token sudah expired" });
    }
    res.status(403).json({ error: "Token tidak valid atau kadaluarsa" });
  }
};