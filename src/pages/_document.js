import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="id">
      <Head>
        <link rel="icon" href="/dinas_ttu.png" />

        {/* Meta sosial media login */}
        <meta property="og:title" content="Absensi Desa Oelneke" />
        <meta property="og:description" content="Aplikasi Absensi Desa Oelneke" />
        <meta property="og:image" content="hhttps://crtyokef2025absensi-pemdes-oelneke.vercel.app/landing_logo.png" />
        <meta property="og:url" content="https://crtyokef2025absensi-pemdes-oelneke.vercel.app" />
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Absensi Desa Oelneke" />
        <meta name="twitter:description" content="Aplikasi Absensi Desa Oelneke" />
        <meta name="twitter:image" content="https://crtyokef2025absensi-pemdes-oelneke.vercel.app/landing_logo.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
