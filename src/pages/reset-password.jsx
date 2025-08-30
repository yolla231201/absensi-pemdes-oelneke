import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";
import styles from "../styles/Login.module.css";
import { IoMdEye, IoIosEyeOff } from "react-icons/io";

export default function ResetPassword() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (password.length < 8) {
      setMessage("Password minimal 8 karakter.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Password dan konfirmasi tidak cocok.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage("✅ Password berhasil diubah! Mengarahkan ke login...");
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch (err) {
      console.error(err);
      setMessage("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.loginContainer}>
        <div className={styles.loginRight}>
          <h2 className={styles.loginTitle}>Buat Password Baru</h2>
          <form className={styles.loginForm} onSubmit={handleSubmit}>
            {/* Input Password Baru */}
            <div className={styles.inputGroup}>
              <label>Password Baru</label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password baru"
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

            {/* Input Konfirmasi Password */}
            <div className={styles.inputGroup}>
              <label>Konfirmasi Password Baru</label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Konfirmasi password baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <span
                  className={styles.togglePassword}
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <IoIosEyeOff /> : <IoMdEye />}
                </span>
              </div>
            </div>

            {message && <div className={styles.warning}>{message}</div>}

            <button
              type="submit"
              className={styles.loginBtn}
              disabled={loading}
            >
              {loading ? "Memproses..." : "Simpan Password Baru"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
