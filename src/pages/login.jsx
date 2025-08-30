import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/Login.module.css";
import Logo from "../assets/images/dinas_ttu.png";
import Image from "next/image";
import { IoMdEye, IoIosEyeOff } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorInput, setErrorInput] = useState({ email: false, password: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setErrorInput({ email: false, password: false });
    setLoading(true);

    try {
      const { data, error } = await login(email, password);
      if (error) {
        setError(error.message === "Invalid login credentials" ? "Email atau password anda salah!" : error.message);
        setErrorInput({ email: true, password: true });
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleClickInput = () => {
    // Hilangkan pesan error saat user klik input
    setError("");
    setErrorInput({ email: false, password: false });
  };

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.loginContainer}>
        <div className={styles.loginLeft}>
          <Image src={Logo} alt="Logo" className={styles.loginLogo} />
          <h1 className={styles.loginLeftTitle}>Pemerintah <br /> Desa Oelneke</h1>
        </div>

        <div className={styles.loginRight}>
          <h2 className={styles.loginTitle}>Login</h2>
          <p className={styles.loginSubtitle}>Selamat Datang! Silahkan masuk dengan akun anda.</p>

          <form className={styles.loginForm} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label>Email</label>
              <input
                type="email"
                placeholder="Masukkan email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onClick={handleClickInput} // klik input hilangkan pesan error
                required
                className={errorInput.email ? styles.inputError : ""}
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
                  onClick={handleClickInput} // klik input hilangkan pesan error
                  required
                  className={errorInput.password ? styles.inputError : ""}
                />
                <span className={styles.togglePassword} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <IoIosEyeOff /> : <IoMdEye />}
                </span>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className={styles.error}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button type="submit" className={styles.loginBtn} disabled={loading}>
              {loading ? "Loading..." : "Login"}
            </button>
          </form>

          <p className={styles.forgotPassword}>
            <a href="/lupa-password">Lupa Password?</a>
          </p>
        </div>
      </div>
    </div>
  );
}
