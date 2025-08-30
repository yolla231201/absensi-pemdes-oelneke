import "../styles/globals.css";
import { AuthProvider } from "../context/AuthContext";
import Navbar from "../components/Navbar/Navbar";
import ProfileMenu from "@/components/ProfileMenu/ProfileMenu";
import { useRouter } from "next/router";
import ProtectedRoute from "../components/ProtectedRoute";

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // Halaman yang boleh diakses tanpa login
  const noAuthRequired = ["/login", "/lupa-password", "/edit-password"];

  // Jangan tampilkan Navbar/ProfileMenu di halaman login atau 404
  const hideNav =
    noAuthRequired.includes(router.pathname) || router.pathname === "/not-found";

  return (
    <AuthProvider>
      {hideNav ? (
        <Component {...pageProps} />
      ) : (
        <ProtectedRoute>
          <div className="appLayout">
            {/* Sidebar desktop */}
            <div className="sidebar">
              <Navbar />
            </div>

            <div className="mainContentWrapper">
              {/* Profile Menu di atas konten */}
              <div className="profileMenuWrapper">
                <ProfileMenu />
              </div>

              {/* Konten halaman */}
              <Component {...pageProps} />
            </div>

            {/* Navbar mobile */}
            <div className="navbarMobileWrapper">
              <Navbar />
            </div>
          </div>
        </ProtectedRoute>
      )}
    </AuthProvider>
  );
}

export default MyApp;
