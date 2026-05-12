import { useState } from "react";
import "./login.css";
import { apiClient } from "../../../utils/apiClient";

function Login({ onLogin }) {
  const [role, setRole] = useState("Mahasiswa");
  const [showPassword, setShowPassword] = useState(false);
  const [nomorInduk, setNomorInduk] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      const data = await apiClient.post("/api/auth/login", {
        nomorInduk: nomorInduk,
        password: password,
        role: role,
      });

      // 1. Simpan token JWT ke localStorage untuk sesi
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));

      // 2. Beritahu App component bahwa login berhasil
      if (onLogin) {
        const rawRole = data.data.user.role || role;
        const formattedRole =
          rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase();
        onLogin(formattedRole);
      }
    } catch (err) {
      setErrorMsg(err.message || "Gagal melakukan login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="login-main">
      {/* Background Elements */}
      <div className="bg-gradient-overlay"></div>
      <div className="circle-decoration-1"></div>
      <div className="circle-decoration-2"></div>

      <div className="login-container">
        {/* Login Card */}
        <div className="login-card">
          {/* Logo & Branding */}
          <div className="brand-header">
            <h2 className="welcome-text">Selamat Datang!!</h2>
            <p className="welcome-subtext">
              Learning Management System Kelompok 8.
            </p>
          </div>

          {/* Role Toggle */}
          <div className="role-toggle">
            <button
              onClick={() => setRole("Mahasiswa")}
              className={`role-button ${role === "Mahasiswa" ? "active" : ""}`}
            >
              Mahasiswa
            </button>
            <button
              onClick={() => setRole("Dosen")}
              className={`role-button ${role === "Dosen" ? "active" : ""}`}
            >
              Dosen
            </button>
          </div>

          <form className="login-form" onSubmit={handleLoginSubmit}>
            {errorMsg && (
              <div
                style={{
                  color: "red",
                  marginBottom: "1rem",
                  fontSize: "14px",
                  textAlign: "center",
                  backgroundColor: "#ffebee",
                  padding: "8px",
                  borderRadius: "4px",
                }}
              >
                {errorMsg}
              </div>
            )}
            {/* Input Field: Nomor Induk */}
            <div className="form-group">
              <label htmlFor="id_number">Nomor Induk</label>
              <div className="input-wrapper">
                <span className="material-symbols-outlined input-icon">
                  person
                </span>
                <input
                  className="input-field"
                  id="id_number"
                  placeholder="Contoh: 2106001234"
                  type="text"
                  value={nomorInduk}
                  onChange={(e) => setNomorInduk(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Input Field: Kata Sandi */}
            <div className="form-group">
              <div className="form-group-header">
                <label htmlFor="password">Kata Sandi</label>
                <a className="forgot-password" href="#">
                  Lupa sandi?
                </a>
              </div>
              <div className="input-wrapper">
                <span className="material-symbols-outlined input-icon">
                  lock
                </span>
                <input
                  className="input-field"
                  id="password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                  type="button"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="remember-me">
              <input id="remember" type="checkbox" />
              <label htmlFor="remember">Tetap masuk di perangkat ini</label>
            </div>

            {/* Primary Button */}
            <button
              className="submit-button"
              type="submit"
              disabled={isLoading}
            >
              <span>{isLoading ? "Memproses..." : "Masuk"}</span>
              {!isLoading && (
                <span className="material-symbols-outlined">arrow_forward</span>
              )}
            </button>
          </form>
        </div>

        {/* Footer Links */}
        <div className="footer">
          <p className="footer-text">
            Belum memiliki akun?{" "}
            <a className="academic-admin-link" href="#">
              Hubungi Administrasi Akademik
            </a>
          </p>
          <div className="footer-links">
            <a href="#">Bantuan</a>
            <a href="#">Privasi</a>
            <a href="#">Syarat</a>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Login;
