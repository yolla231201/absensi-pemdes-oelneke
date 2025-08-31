import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Alert from "../components/Alert/Alert";
import ProtectedRoute from "../components/ProtectedRoute";
import styles from "../styles/BuatPengumuman.module.css";
import swal from "sweetalert";

const BuatPengumuman = () => {
  const [pengumumanList, setPengumumanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [form, setForm] = useState({ judul: "", isi: "" });
  const [editingId, setEditingId] = useState(null);
  const [openId, setOpenId] = useState(null); // <-- ID yg sedang dibuka

  const fetchPengumuman = async () => {
    setMessage(null);
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
    setMessage(null);

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
    try {
      const willDelete = await swal({
        title: "Yakin?",
        text: "Apakah kamu yakin ingin menghapus pengumuman ini?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      });

      if (!willDelete) return;

      const { error } = await supabase.from("pengumuman").delete().eq("id", id);

      if (error) throw error;
      await swal("Deleted!", "Pengumuman berhasil dihapus.", "success");
      fetchPengumuman();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const toggleLihat = (id) => {
    setOpenId(openId === id ? null : id); // kalau klik sama ID → tutup
  };

  return (
    <ProtectedRoute allowedRoles={["kepala_desa"]}>
      <div className={styles.wrapper}>
        <main className={styles.main}>
          <h1 className={styles.title}>Buat Pengumuman</h1>

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
            <div className={styles.formActions}>
              <button className={styles.saveBtn} onClick={handleSave}>
                {editingId ? "Perbarui" : "Tambahkan"}
              </button>
            </div>
          </div>

          <div className={styles.list}>
            {loading ? (
              <div className={styles.listInfo}>
                <p>Loading...</p>
              </div>
            ) : pengumumanList.length === 0 ? (
              <div className={styles.listInfo}>
                <p>Belum ada pengumuman</p>
              </div>
            ) : (
              pengumumanList.map((item) => (
                <div key={item.id} className={styles.announceCard}>
                  <div className={styles.announceContent}>
                    <div className={styles.announceHeader}>
                      <h3>{item.judul}</h3>
                    </div>

                    {/* isi pendek / lihat detail */}
                    {openId === item.id ? (
                      <>
                        <p>{item.isi}</p>
                        <span className={styles.date}>
                          {new Date(item.tanggal).toLocaleDateString("id-ID", {
                            weekday: "long",
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </>
                    ) : (
                      <p>{item.isi.slice(0, 50)}...</p>
                    )}
                  </div>

                  <div className={styles.actions}>
                    <button
                      className={styles.viewBtn}
                      onClick={() => toggleLihat(item.id)}
                    >
                      {openId === item.id ? "Tutup" : "Lihat"}
                    </button>
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
