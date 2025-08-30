import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Alert from "../components/Alert/Alert";
import ProtectedRoute from "../components/ProtectedRoute";
import styles from "../styles/BuatPengumuman.module.css";

const BuatPengumuman = () => {
  const [pengumumanList, setPengumumanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [form, setForm] = useState({ judul: "", isi: "" });
  const [editingId, setEditingId] = useState(null);

  // ambil data pengumuman
  const fetchPengumuman = async () => {
    setMessage(null); // reset alert agar fresh
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("pengumuman")
        .select("*")
        .order("tanggal", { ascending: false });

      if (error) throw error;
      setPengumumanList(data);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPengumuman();
  }, []);

  const handleChange = (e, field) =>
    setForm({ ...form, [field]: e.target.value });

  const handleSave = async () => {
    setMessage(null); // reset dulu

    if (!form.judul || !form.isi) {
      setMessage({
        type: "warning",
        text: "⚠️ Judul dan Isi tidak boleh kosong",
      });
      return;
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from("pengumuman")
          .update({ ...form, tanggal: new Date().toISOString() })
          .eq("id", editingId);

        if (error) throw error;
        setMessage({
          type: "success",
          text: "✅ Pengumuman berhasil diperbarui!",
        });
      } else {
        const { error } = await supabase
          .from("pengumuman")
          .insert({ ...form, tanggal: new Date().toISOString() });

        if (error) throw error;
        setMessage({
          type: "success",
          text: "✅ Pengumuman berhasil dibuat!",
        });
      }

      // reset form
      setForm({ judul: "", isi: "" });
      setEditingId(null);
      fetchPengumuman();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const handleEdit = (item) => {
    setForm({ judul: item.judul, isi: item.isi });
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    if (!
      window.confirm("Apakah Anda yakin ingin menghapus pengumuman ini?"))
      return;
    try {
      const { error } = await supabase.from("pengumuman").delete().eq("id", id);
      if (error) throw error;
      setMessage({
        type: "success",
        text: "✅ Pengumuman berhasil dihapus!",
      });
      fetchPengumuman();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  return (
    <ProtectedRoute allowedRoles={["kepala_desa"]}>
      <div className={styles.wrapper}>
        <main className={styles.main}>
          <h1 className={styles.title}>Buat Pengumuman</h1>

          {/* ✅ Alert dipanggil sekali dengan props sesuai komponenmu */}
          {message && (
            <Alert
              message={message.text}
              type={message.type}
              duration={3000}
              onClose={() => setMessage(null)}
            />
          )}

          <div className={styles.form}>
            <label>
              Judul
              <input
                type="text"
                value={form.judul}
                onChange={(e) => handleChange(e, "judul")}
              />
            </label>
            <label>
              Isi
              <textarea
                rows="4"
                value={form.isi}
                onChange={(e) => handleChange(e, "isi")}
              />
            </label>
            <button className={styles.saveBtn} onClick={handleSave}>
              {editingId ? "Perbarui" : "Tambahkan"}
            </button>
          </div>

          <div className={styles.list}>
            {loading ? (
              <p>Loading...</p>
            ) : pengumumanList.length === 0 ? (
              <p>Belum ada pengumuman.</p>
            ) : (
              pengumumanList.map((item) => (
                <div key={item.id} className={styles.card}>
                  <div className={styles.cardContent}>
                    <div className={styles.cardHeader}>
                      <h3>{item.judul}</h3>
                      <span>
                        {new Date(item.tanggal).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                    <p>{item.isi}</p>
                  </div>
                  <div className={styles.actions}>
                    <button
                      className={styles.editBtn}
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(item.id)}
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default BuatPengumuman;
