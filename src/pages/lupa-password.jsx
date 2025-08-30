import { useState } from "react";
import { supabase } from "../lib/supabase";
import styles from "../styles/Login.module.css";

export default function LupaPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Email reset password telah dikirim. Silakan cek inbox.");
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
          <h2 className={styles.loginTitle}>Reset Password</h2>
          <p className={styles.loginSubtitle}>Masukkan email akun Anda, lalu cek inbox untuk reset password.</p>

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

            {message && <div className={styles.warning}>{message}</div>}

            <button type="submit" className={styles.loginBtn} disabled={loading}>
              {loading ? "Mengirim..." : "Kirim Email Reset"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
