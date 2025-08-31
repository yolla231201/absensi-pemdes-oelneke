// src/pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  const siteUrl = "https://crtyokef2025absensi-pemdes-oelneke.vercel.app";
  const ogImage = `${siteUrl}/landing_logo.png`; // pastikan ada di /public

  return (
    <Html lang="id">
      <Head>
        {/* Favicon */}
        <link rel="icon" href="/dinas_ttu.png" />

        {/* Meta SEO dasar */}
        <meta name="description" content="Aplikasi Absensi Desa Oelneke" />
        <meta name="keywords" content="absensi, desa, Oelneke, aplikasi" />

        {/* Open Graph / Facebook */}
        <meta property="og:title" content="Absensi Desa Oelneke" />
        <meta property="og:description" content="Aplikasi Absensi Desa Oelneke" />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:type" content="website" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Absensi Desa Oelneke" />
        <meta name="twitter:description" content="Aplikasi Absensi Desa Oelneke" />
        <meta name="twitter:image" content={ogImage} />

        {/* LinkedIn biasanya menggunakan OG tags juga */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
