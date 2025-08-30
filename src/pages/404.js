import Link from "next/link";
import styles from "../styles/NotFound.module.css";

export default function NotFound() {
  return (
    <div className={styles.notFound}>
      <h1>404 - Halaman Tidak Ditemukan</h1>
      <Link href="/">Kembali ke Beranda</Link>
    </div>
  );
}
