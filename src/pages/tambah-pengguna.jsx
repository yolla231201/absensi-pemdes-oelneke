// src/pages/tambah-pengguna.jsx
import React, { useState, useEffect } from "react";
import { IoMdEye, IoIosEyeOff } from "react-icons/io";
import Alert from "../components/Alert/Alert";
import ProtectedRoute from "../components/ProtectedRoute";
import styles from "../styles/TambahPengguna.module.css";

const jabatanMap = {
  kepala_desa: "Kepala Desa",
  sekretaris: "Sekretaris",
  kaur_tu: "Kaur TU",
  kaur_keuangan: "Kaur Keuangan",
  kaur_perencanaan: "Kaur Perencanaan",
  kasi_pemerintahan: "Kasi Pemerintahan",
  kasi_kesejahteraan: "Kasi Kesejahteraan",
  kasi_pelayanan: "Kasi Pelayanan",
  kepala_dusun_a: "Kepala Dusun A",
  kepala_dusun_b: "Kepala Dusun B",
  lainnya: "Lainnya",
};

const TambahPengguna = () => {
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [password, setPassword] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [jabatanDisabled, setJabatanDisabled] = useState({});

  const showToast = (msg) => setToastMessage(msg);

  useEffect(() => {
    const checkJabatan = async () => {
      const newDisabled = {};
      for (const [key, label] of Object.entries(jabatanMap)) {
        try {
          const res = await fetch(
            `/api/route?jabatan=${encodeURIComponent(label)}`
          );
          const data = await res.json();
          newDisabled[key] = data.exists;
        } catch {
          newDisabled[key] = false;
        }
      }
      setJabatanDisabled(newDisabled);
    };
    checkJabatan();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      showToast(
        "Password minimal 8 karakter dan terdiri dari huruf dan angka."
      );
      return;
    }
    if (password !== konfirmasiPassword) {
      showToast("Password dan konfirmasi tidak cocok!");
      return;
    }
    if (!jabatan) {
      showToast("Silakan pilih jabatan!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama,
          email,
          password,
          jabatan: jabatanMap[jabatan],
          role: "staf",
        }),
      });
      const data = await res.json();
      showToast(data.message || data.error || "Terjadi kesalahan server");
      if (res.ok) {
        setNama("");
        setEmail("");
        setJabatan("");
        setPassword("");
        setKonfirmasiPassword("");
      }
    } catch {
      showToast("Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["kepala_desa"]}>
      <div className={styles.wrapper}>
        <main className={styles.main}>
          <h1 className={styles.title}>Tambah Pegawai</h1>
          <form className={styles.form} onSubmit={handleSubmit}>
            {["Nama Lengkap", "Email"].map((label, i) => (
              <div className={styles.inputGroup} key={i}>
                <label>{label}</label>
                <input
                  type={label === "Email" ? "email" : "text"}
                  value={label === "Email" ? email : nama}
                  onChange={(e) =>
                    label === "Email"
                      ? setEmail(e.target.value)
                      : setNama(e.target.value)
                  }
                  required
                />
              </div>
            ))}
            <div className={styles.inputGroup}>
              <label>Jabatan</label>
              <select
                value={jabatan}
                onChange={(e) => setJabatan(e.target.value)}
                required
              >
                <option value="">-- Pilih Jabatan --</option>
                {Object.entries(jabatanMap).map(([key, label]) => (
                  <option key={key} value={key} disabled={jabatanDisabled[key]}>
                    {label} {jabatanDisabled[key] ? "(Sudah Terdaftar)" : ""}
                  </option>
                ))}
              </select>
            </div>
            {["Password", "Konfirmasi Password"].map((label, i) => (
              <div className={styles.inputGroup} key={i}>
                <label>{label}</label>
                <div className={styles.passwordWrapper}>
                  <input
                    type={
                      (
                        label === "Password"
                          ? showPassword
                          : showConfirmPassword
                      )
                        ? "text"
                        : "password"
                    }
                    value={label === "Password" ? password : konfirmasiPassword}
                    onChange={(e) =>
                      label === "Password"
                        ? setPassword(e.target.value)
                        : setKonfirmasiPassword(e.target.value)
                    }
                    required
                    onPaste={
                      label === "Konfirmasi Password"
                        ? (e) => e.preventDefault()
                        : undefined
                    }
                  />
                  <span
                    className={styles.togglePassword}
                    onClick={() =>
                      label === "Password"
                        ? setShowPassword(!showPassword)
                        : setShowConfirmPassword(!showConfirmPassword)
                    }
                  >
                    {label === "Password" ? (
                      showPassword ? (
                        <IoIosEyeOff />
                      ) : (
                        <IoMdEye />
                      )
                    ) : showConfirmPassword ? (
                      <IoIosEyeOff />
                    ) : (
                      <IoMdEye />
                    )}
                  </span>
                </div>
              </div>
            ))}
            <div className={styles.buttonWrapper}>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={loading}
              >
                {loading ? "Mendaftar..." : "Daftar"}
              </button>
            </div>
          </form>
          {toastMessage && (
            <Alert
              message={toastMessage}
              onClose={() => setToastMessage(null)}
            />
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default TambahPengguna;
