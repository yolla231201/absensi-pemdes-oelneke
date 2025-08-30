import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Loading from "../components/ProfileMenu/Loading/Loading";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Ambil session saat pertama load
  useEffect(() => {
    const initAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, nama, jabatan")
          .eq("user_id", session.user.id)
          .maybeSingle();

        const fullUser = { ...session.user, ...profile };
        setUser(fullUser);
        localStorage.setItem("user", JSON.stringify(fullUser));
      }

      setLoading(false);
    };

    initAuth();

    // 🔹 Listener hanya untuk perubahan login/logout
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          supabase
            .from("profiles")
            .select("role, nama, jabatan")
            .eq("user_id", session.user.id)
            .maybeSingle()
            .then(({ data: profile }) => {
              const fullUser = { ...session.user, ...profile };
              setUser(fullUser);
              localStorage.setItem("user", JSON.stringify(fullUser));
            });
        } else {
          setUser(null);
          localStorage.removeItem("user");
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // 🔹 Login manual dari form
  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      // Ambil profil langsung tanpa menunggu listener
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, nama, jabatan")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile)
        throw new Error("Akun ini belum terdaftar di sistem desa.");

      const fullUser = { ...data.user, ...profile };
      setUser(fullUser);
      localStorage.setItem("user", JSON.stringify(fullUser));

      return { data: { user: data.user, profile }, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  // 🔹 Logout
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem("user");
  };

  if (loading) return <Loading message="Menyiapkan aplikasi..." />;

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
