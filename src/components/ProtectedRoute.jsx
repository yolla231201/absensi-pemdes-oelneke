import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import Loading from "./ProfileMenu/Loading/Loading";
import { useEffect, useState } from "react";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!loading) {
      // cek login
      if (!user) {
        router.replace("/login");
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        router.replace("/404");
      }
      setChecked(true);
    }
  }, [loading, user, allowedRoles, router]);

  if (loading || !checked) return <Loading message="Memeriksa akses halaman..." />;

  if (!user || (allowedRoles && !allowedRoles.includes(user.role))) return null;

  return children;
};

export default ProtectedRoute;
