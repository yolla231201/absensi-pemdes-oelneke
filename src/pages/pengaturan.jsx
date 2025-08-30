// src/pages/pengaturan.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Alert from "../components/Alert/Alert";
import ProtectedRoute from "../components/ProtectedRoute";
import styles from "../styles/Pengaturan.module.css";

const Pengaturan = () => {
  const [settings, setSettings] = useState({
    id: 1,
    jam_mulai: "",
    jam_selesai: "",
    max_jarak: "",
    latitude: "",
    longitude: "",
  });
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null); // { type: "success"|"error"|"warning", message: "..." }
  const [editing, setEditing] = useState(false);

  // Ambil data pengaturan awal
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("pengaturan")
          .select("*")
          .eq("id", 1)
          .single();

        if (error) throw error;
        setSettings(data);
      } catch (err) {
        setAlert({
          type: "error",
          message: "Gagal mengambil data: " + err.message,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Handle perubahan input
  const handleChange = (e, field) => {
    setSettings({ ...settings, [field]: e.target.value });
  };

  // Simpan perubahan atau toggle edit
  const handleToggleEdit = async () => {
    if (editing) {
      try {
        const { error } = await supabase
          .from("pengaturan")
          .update({
            jam_mulai: settings.jam_mulai,
            jam_selesai: settings.jam_selesai,
            max_jarak: settings.max_jarak,
            latitude: settings.latitude,
            longitude: settings.longitude,
          })
          .eq("id", 1);

        if (error) throw error;
        setAlert({ type: "success", message: "✅ Data berhasil disimpan!" });
      } catch (err) {
        setAlert({
          type: "error",
          message: "⚠️ Gagal menyimpan: " + err.message,
        });
      }
    }
    setEditing(!editing);
  };

  return (
    <ProtectedRoute allowedRoles={["kepala_desa"]}>
      <div className={styles.wrapper}>
        <main className={styles.main}>
          <h1 className={styles.title}>Pengaturan Absensi</h1>

          {alert && (
            <Alert
              type={alert.type}
              message={alert.message}
              duration={4000}
              onClose={() => setAlert(null)}
            />
          )}

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className={styles.form}>
              <label>
                Jam Mulai
                <input
                  type="time"
                  value={settings.jam_mulai}
                  onChange={(e) => handleChange(e, "jam_mulai")}
                  disabled={!editing}
                />
              </label>

              <label>
                Jam Selesai
                <input
                  type="time"
                  value={settings.jam_selesai}
                  onChange={(e) => handleChange(e, "jam_selesai")}
                  disabled={!editing}
                />
              </label>

              <label>
                Max Jarak (m)
                <input
                  type="number"
                  value={settings.max_jarak}
                  onChange={(e) => handleChange(e, "max_jarak")}
                  disabled={!editing}
                />
              </label>

              <label>
                Latitude
                <input
                  type="text"
                  value={settings.latitude}
                  onChange={(e) => handleChange(e, "latitude")}
                  disabled={!editing}
                />
              </label>

              <label>
                Longitude
                <input
                  type="text"
                  value={settings.longitude}
                  onChange={(e) => handleChange(e, "longitude")}
                  disabled={!editing}
                />
              </label>

              
              <div className={styles.buttonWrapper}>
                <button
                  className={editing ? styles.saveBtn : styles.editBtn}
                  onClick={handleToggleEdit}
                >
                  {editing ? "Simpan" : "Edit"}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Pengaturan;
