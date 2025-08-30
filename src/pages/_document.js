// src/pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="id">
      <Head>
        {/* Bisa tambahkan font, favicon, meta tag */}
        <link rel="icon" href="/dinas_ttu.png" />
      </Head>
      <body>
        <Main />       {/* Tempat semua halaman dirender */}
        <NextScript /> {/* Script Next.js */}
      </body>
    </Html>
  );
}
