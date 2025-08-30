// src/pages/index.jsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login'); // otomatis redirect ke halaman login
  }, [router]);

  return null;
}
