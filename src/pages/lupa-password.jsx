import { useState } from "react";
import { supabase } from "../lib/supabase";
import styles from "../styles/Login.module.css";
import { motion, AnimatePresence } from "framer-motion";

export default function LupaPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" atau "error"

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    setLoading(true);

    try {
      // 1. Cek email di Supabase Auth melalui route server
      const resCheck = await fetch("/api/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const checkData = await resCheck.json();

      if (!checkData.exists) {
        setMessage("Email tidak terdaftar. Silakan hubungi kepala desa.");
        setMessageType("error");
        return;
      }

      // 2. Jika ada, kirim email reset
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setMessage(error.message);
        setMessageType("error");
      } else {
        setMessage("Email reset password telah dikirim. Silakan cek inbox.");
        setMessageType("success");
      }
    } catch (err) {
      console.error(err);
      setMessage("Terjadi kesalahan. Coba lagi.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.loginContainer}>
        <div className={styles.loginRight}>
          <h2 className={styles.loginTitle}>Reset Password</h2>
          <p className={styles.loginSubtitle}>
            Masukkan email akun Anda, lalu cek inbox untuk reset password.
          </p>

          <form className={styles.loginForm} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label>Email</label>
              <input
                type="email"
                placeholder="Masukkan email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => {
                  setMessage(""); // hilangkan pesan saat input di-klik/fokus
                  setMessageType("");
                }}
                required
              />
            </div>

            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className={
                    messageType === "success" ? styles.success : styles.error
                  }
                >
                  {message}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              className={styles.loginBtn}
              disabled={loading}
            >
              {loading ? "Mengirim..." : "Kirim Email Reset"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
