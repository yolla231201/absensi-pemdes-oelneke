import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import styles from "../styles/Pengumuman.module.css";

const Pengumuman = () => {
  const [pengumuman, setPengumuman] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [openIndex, setOpenIndex] = useState(null); // hanya simpan index yang terbuka

  useEffect(() => {
    const fetchPengumuman = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("pengumuman")
          .select("*")
          .order("tanggal", { ascending: false });
        if (error) throw error;
        setPengumuman(data);
      } catch (err) {
        console.error("Gagal fetch pengumuman:", err);
        setMessage("⚠️ Gagal mengambil data pengumuman: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPengumuman();
  }, []);

  const toggleLihat = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx); // kalau klik yg sama → tutup
  };

  return (
    <div className={styles.wrapper}>
      <main className={styles.main}>
        <h1 className={styles.title}>Pengumuman</h1>

        {message && <div className={styles.alert}>{message}</div>}

        <div className={styles.list}>
          {loading ? (
            <p>Loading...</p>
          ) : pengumuman.length === 0 ? (
            <p>Belum ada pengumuman.</p>
          ) : (
            pengumuman.map((item, idx) => (
              <div className={styles.card} key={idx}>
                <div className={styles.cardHeader}>
                  <h3>{item.judul}</h3>
                  <span>
                    {new Date(item.tanggal).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {openIndex === idx ? (
                  <p className={styles.isi}>{item.isi}</p>
                ) : (
                  <p className={styles.isi}>dsda......</p>
                )}

                <div className={styles.cardFooter}>
                  <button
                    className={styles.lihatBtn}
                    onClick={() => toggleLihat(idx)}
                  >
                    {openIndex === idx ? "Tutup" : "Lihat"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Pengumuman;
