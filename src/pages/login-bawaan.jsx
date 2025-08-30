import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/Login.module.css";
import Logo from "../assets/images/dinas_ttu.png";
import Image from "next/image";
import { IoMdEye, IoIosEyeOff } from "react-icons/io";
import Loading from "../components/ProfileMenu/Loading/Loading";

const LoginPage = () => {
  const { login, setUser } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await login(email, password);
      if (error) throw error;
      if (!data?.profile) {
        throw new Error(
          "Akun ini belum terdaftar di sistem desa. Hubungi Kepala Desa."
        );
      }

      const fullUser = { ...data.user, ...data.profile };
      setUser(fullUser);
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      showToast(err.message || "Login gagal. Cek email dan password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.loginContainer}>
        <div className={styles.loginLeft}>
          <Image src={Logo} alt="Logo" className={styles.loginLogo} />
          <h1 className={styles.loginLeftTitle}>
            Pemerintah <br /> Desa Oelneke
          </h1>
        </div>

        <div className={styles.loginRight}>
          <h2 className={styles.loginTitle}>Login</h2>
          <p className={styles.loginSubtitle}>
            Selamat Datang! Silahkan masuk dengan akun anda.
          </p>

          <form className={styles.loginForm} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label>Email</label>
              <input
                type="email"
                placeholder="Masukkan email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className={`${styles.inputGroup} ${styles.passwordGroup}`}>
              <label>Password</label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span
                  className={styles.togglePassword}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <IoIosEyeOff /> : <IoMdEye />}
                </span>
              </div>
            </div>

            <button
              type="submit"
              className={styles.loginBtn}
              disabled={loading}
            >
              {loading ? <Loading /> : "Login"}
            </button>
          </form>

          {toast && <div className={styles.toast}>{toast}</div>}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
