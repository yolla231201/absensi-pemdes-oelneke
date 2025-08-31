import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "../lib/supabase";
import styles from "../styles/RiwayatAbsen.module.css";

const RiwayatAbsen = () => {
  const [riwayatData, setRiwayatData] = useState([]);
  const [filter, setFilter] = useState("hari");
  const [role, setRole] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const getReportTitle = () => {
    const now = new Date();
    if (filter === "hari") {
      return "Riwayat Absensi Hari " + now.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    if (filter === "minggu") {
      const currentDay = now.getDay();
      const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
      const monday = new Date(now);
      monday.setDate(now.getDate() + diffToMonday);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return `Riwayat Absensi Minggu Ini (${monday.toLocaleDateString("id-ID")} - ${sunday.toLocaleDateString("id-ID")})`;
    }
    if (filter === "bulan") {
      return "Riwayat Absensi Bulan " + now.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
    }
    return "Riwayat Absensi";
  };

  const getReportTitleText = () => getReportTitle();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error("User belum login");

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", user.id)
          .single();
        if (profileError) throw profileError;

        const userRole = profile?.role;
        setRole(userRole);

        const now = new Date();
        let gteDate, lteDate;
        if (filter === "hari") {
          const today = now.toISOString().split("T")[0];
          gteDate = today + "T00:00:00Z";
          lteDate = today + "T23:59:59Z";
        } else if (filter === "minggu") {
          const currentDay = now.getDay();
          const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
          const monday = new Date(now);
          monday.setDate(now.getDate() + diffToMonday);
          const sunday = new Date(monday);
          sunday.setDate(monday.getDate() + 6);
          gteDate = monday.toISOString();
          lteDate = sunday.toISOString();
        } else if (filter === "bulan") {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          gteDate = startOfMonth.toISOString();
          lteDate = endOfMonth.toISOString();
        }

        let query = supabase
          .from("absensi")
          .select("status, waktu_absensi, profiles!inner(user_id, nama)")
          .gte("waktu_absensi", gteDate)
          .lte("waktu_absensi", lteDate)
          .order("waktu_absensi", { ascending: false });

        if (userRole === "staf") {
          query = query.eq("profiles.user_id", user.id);
        }

        const { data, error } = await query;
        if (error) throw error;

        setRiwayatData(
          data.map((item) => ({
            nama: item.profiles.nama,
            status: item.status,
            waktu: item.waktu_absensi,
          }))
        );
      } catch (err) {
        console.error(err);
        setMessage("⚠️ " + err.message);
      } finally {
        setLoading(false);
        setCurrentPage(1);
      }
    };

    fetchData();
  }, [filter]);

  const totalPages = Math.ceil(riwayatData.length / perPage);
  const currentData = riwayatData.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      riwayatData.map((item) => ({
        Nama: item.nama,
        Status: item.status,
        Waktu: new Date(item.waktu).toLocaleDateString("id-ID") + " | " + new Date(item.waktu).toLocaleTimeString("id-ID"),
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Riwayat Absen");
    XLSX.writeFile(workbook, getReportTitleText() + ".xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(getReportTitleText(), 14, 15);
    const tableRows = riwayatData.map((item) => [
      item.nama,
      item.status,
      new Date(item.waktu).toLocaleDateString("id-ID") + " | " + new Date(item.waktu).toLocaleTimeString("id-ID"),
    ]);
    autoTable(doc, {
      head: [["Nama", "Status", "Waktu"]],
      body: tableRows,
      startY: 25,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [124, 77, 255] },
    });
    doc.save(getReportTitleText() + ".pdf");
  };

  return (
    <div className={styles.wrapper}>
      <main className={styles.main}>
        <h1 className={styles.title}>Riwayat Absensi</h1>
        {message && <div className={styles.alert}>{message}</div>}

        <div className={styles.filterButtons}>
          {role === "kepala_desa" && (
            <button className={filter === "hari" ? styles.active : ""} onClick={() => setFilter("hari")}>Hari Ini</button>
          )}
          <button className={filter === "minggu" ? styles.active : ""} onClick={() => setFilter("minggu")}>Minggu Ini</button>
          <button className={filter === "bulan" ? styles.active : ""} onClick={() => setFilter("bulan")}>Bulan Ini</button>
        </div>

        {role === "kepala_desa" && (
          <div className={styles.exportButtons}>
            <button onClick={exportExcel} className={styles.excel}>Excel</button>
            <button onClick={exportPDF} className={styles.pdf}>PDF</button>
          </div>
        )}

        <div className={styles.tableContainer}>
          <div className={styles.tableTitle}>{getReportTitle()}</div>
          {loading ? (
            <p className={styles.loading}>Loading...</p>
          ) : riwayatData.length === 0 ? (
            <div className={styles.emptyCard}><p>Data absensi belum ada.</p></div>
          ) : (
            <div className={styles.tableResponsive}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Status</th>
                    <th>Waktu</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.nama}</td>
                      <td>
                        <span className={`${styles.status} ${styles[item.status?.toLowerCase()]}`}>{item.status}</span>
                      </td>
                      <td>{new Date(item.waktu).toLocaleDateString("id-ID") + " | " + new Date(item.waktu).toLocaleTimeString("id-ID")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className={styles.pagination}>
            <button onClick={handlePrev} disabled={currentPage === 1}>&lt; Sebelumnya</button>
            <span>{currentPage} / {totalPages || 1}</span>
            <button onClick={handleNext} disabled={currentPage === totalPages}>Selanjutnya &gt;</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RiwayatAbsen;
