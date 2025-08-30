import React, { useState, useEffect } from "react";
import { FiMapPin } from "react-icons/fi";
import Alert from "../components/Alert/Alert";
import { supabase } from "../lib/supabase";
import styles from "../styles/AbsenHarian.module.css";

const AbsensiHarian = () => {
  const [status, setStatus] = useState("Hadir");
  const [keterangan, setKeterangan] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [distance, setDistance] = useState(null);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [errorKeterangan, setErrorKeterangan] = useState(false);
  const [errorLokasi, setErrorLokasi] = useState(false);
  const [pengaturan, setPengaturan] = useState(null);
  const [todayAbsensi, setTodayAbsensi] = useState(null);
  const [formDisabled, setFormDisabled] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  const [authUser, setAuthUser] = useState(null);

  // Ambil user login
  useEffect(() => {
    const fetchAuthUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setAuthUser(data.user);
    };
    fetchAuthUser();
  }, []);

  // Ambil pengaturan jam + lokasi kantor
  useEffect(() => {
    const fetchPengaturan = async () => {
      const { data: pengaturan, error } = await supabase
        .from("pengaturan")
        .select("*")
        .eq("id", 1)
        .single();
      if (error)
        setAlert({ type: "error", message: "Gagal ambil pengaturan: " + error.message });
      else setPengaturan(pengaturan);
    };
    fetchPengaturan();
  }, []);

  // Cek absensi hari ini
  useEffect(() => {
    const fetchTodayAbsensi = async () => {
      if (!authUser) return;
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("absensi")
        .select("*")
        .eq("user_id", authUser.id)
        .gte("waktu_absensi", today + "T00:00:00Z")
        .lte("waktu_absensi", today + "T23:59:59Z");

      if (error)
        setAlert({ type: "error", message: "Gagal ambil absensi: " + error.message });
      else setTodayAbsensi(data?.[0] || null);
    };
    fetchTodayAbsensi();
  }, [authUser]);

  // Atur form bisa edit/tidak
  useEffect(() => {
    if (!pengaturan) return;
    const now = new Date();
    const [hStart, mStart, sStart] = pengaturan.jam_mulai.split(":").map(Number);
    const [hEnd, mEnd, sEnd] = pengaturan.jam_selesai.split(":").map(Number);

    const startTime = new Date();
    startTime.setHours(hStart, mStart, sStart, 0);
    const endTime = new Date();
    endTime.setHours(hEnd, mEnd, sEnd, 0);
    if (endTime < startTime) endTime.setDate(endTime.getDate() + 1);

    if (todayAbsensi) {
      setStatus(todayAbsensi.status);
      setKeterangan(todayAbsensi.keterangan || "");
      if (now >= startTime && now <= endTime) {
        setCanEdit(true);
        setFormDisabled(false);
      } else {
        setCanEdit(false);
        setFormDisabled(true);
      }
    } else {
      if (now >= startTime && now <= endTime) {
        setFormDisabled(false);
      } else {
        setFormDisabled(true);
      }
    }
  }, [pengaturan, todayAbsensi]);

  // Hitung jarak
  const getDistanceFromLatLonInMeter = (lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Ambil lokasi
  const getLokasi = () => {
    if (!navigator.geolocation) {
      setAlert({ type: "error", message: "Geolocation tidak didukung!" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLokasi(`Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
        if (pengaturan) {
          const jarak = getDistanceFromLatLonInMeter(
            lat,
            lng,
            pengaturan.latitude,
            pengaturan.longitude
          );
          setDistance(jarak);
          setErrorLokasi(false);
          if (status === "Hadir" && jarak > pengaturan.max_jarak) {
            setAlert({ type: "warning", message: "Jarak terlalu jauh untuk absen Hadir!" });
          }
        }
      },
      (err) => setAlert({ type: "error", message: "Gagal ambil lokasi: " + err.message })
    );
  };

  // Kirim absensi
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formDisabled) return;

    if (!lokasi.trim()) {
      setAlert({ type: "warning", message: "Harap ambil lokasi Anda!" });
      setErrorLokasi(true);
      return;
    }

    if (status === "Hadir" && distance > pengaturan?.max_jarak) {
      setAlert({ type: "error", message: "Jarak terlalu jauh, tidak bisa absen Hadir!" });
      return;
    }

    if ((status === "Sakit" || status === "Izin") && !keterangan.trim()) {
      setAlert({ type: "warning", message: "Harap isi keterangan jika Sakit/Izin!" });
      setErrorKeterangan(true);
      return;
    }

    try {
      if (todayAbsensi && canEdit) {
        const { data, error } = await supabase
          .from("absensi")
          .update({
            status,
            keterangan,
            waktu_absensi: new Date().toISOString(),
          })
          .eq("id", todayAbsensi.id)
          .select();

        if (error) throw error;
        setAlert({ type: "success", message: "Absensi berhasil diperbarui!" });
        setTodayAbsensi(data[0]);
      } else if (!todayAbsensi) {
        const { data, error } = await supabase
          .from("absensi")
          .insert([
            {
              user_id: authUser.id,
              status,
              keterangan,
              waktu_absensi: new Date().toISOString(),
            },
          ])
          .select();
        if (error) throw error;
        setAlert({ type: "success", message: "Absensi berhasil dikirim!" });
        setTodayAbsensi(data[0]);
      } else {
        setAlert({ type: "warning", message: "Waktu edit absensi sudah lewat." });
      }

      setLokasi("");
      setDistance(null);
    } catch (err) {
      console.error("Gagal mengirim absensi:", err);
      setAlert({ type: "error", message: "Gagal mengirim absensi: " + err.message });
    }
  };

  return (
    <main className={styles.absensiHarian}>
      <h1 className={styles.absensiTitle}>Absensi Harian</h1>

      {alert.message && (
        <Alert
          message={alert.message}
          type={alert.type}
          duration={4000}
          onClose={() => setAlert({ type: "", message: "" })}
        />
      )}

      <form className={styles.absensiForm} onSubmit={handleSubmit}>
        {(status === "Sakit" || status === "Izin") && (
          <div className={styles.formGroup}>
            <label>Keterangan</label>
            <input
              type="text"
              placeholder="Isi keterangan..."
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className={errorKeterangan ? styles.inputError : ""}
              disabled={formDisabled}
            />
          </div>
        )}

        <div className={styles.formGroup}>
          <label>Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={formDisabled}
          >
            <option value="Hadir">Hadir</option>
            <option value="Sakit">Sakit</option>
            <option value="Izin">Izin</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Lokasi Saat Ini</label>
          <div className={styles.lokasiInputWrapper}>
            <input
              type="text"
              placeholder="Klik tombol untuk ambil lokasi"
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
              className={errorLokasi ? styles.inputError : ""}
              disabled={formDisabled}
            />
            <button
              type="button"
              className={styles.lokasiBtn}
              onClick={getLokasi}
              disabled={formDisabled}
            >
              <FiMapPin size={18} />
            </button>
          </div>
        </div>

        <div className={styles.submitRow}>
          <p
            className={
              status === "Hadir" && distance > pengaturan?.max_jarak
                ? styles.distanceOut
                : styles.distanceOk
            }
          >
            {distance !== null ? `Jarak: ${Math.round(distance)} m` : ""}
          </p>
          <button type="submit" disabled={formDisabled}>
            {todayAbsensi && canEdit ? "Update Absensi" : "Kirim Absensi"}
          </button>
        </div>
      </form>
    </main>
  );
};

export default AbsensiHarian;
