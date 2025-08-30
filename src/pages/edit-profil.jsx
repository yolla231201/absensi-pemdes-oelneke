import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Alert from "../components/Alert/Alert";
import styles from "../styles/EditProfil.module.css";
import { IoMdEye, IoIosEyeOff } from "react-icons/io";

const EditProfil = () => {
  const [profile, setProfile] = useState({
    nama: "",
    user_id: null,
  });
  const [formData, setFormData] = useState({
    nama: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [editing, setEditing] = useState(false);

  // Fetch profil user
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("User belum login");

      const { data, error } = await supabase
        .from("profiles")
        .select("nama, user_id")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setFormData((prev) => ({
        ...prev,
        nama: data.nama,
      }));
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: err.message, time: Date.now() });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle input
  const handleChange = (e, field) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  // Toggle show password
  const toggleShow = (field) => {
    setShowPassword({ ...showPassword, [field]: !showPassword[field] });
  };

  // Cek apakah ada perubahan
  const hasChanges =
    formData.nama !== profile.nama ||
    formData.oldPassword ||
    formData.newPassword ||
    formData.confirmPassword;

  // Simpan perubahan
  const handleSave = async () => {
    try {
      setMessage(null); // reset dulu supaya alert selalu fresh

      // Update nama
      if (formData.nama !== profile.nama) {
        const { error } = await supabase
          .from("profiles")
          .update({ nama: formData.nama })
          .eq("user_id", profile.user_id);
        if (error) throw error;
      }

      // Update password jika diisi
      if (formData.oldPassword || formData.newPassword || formData.confirmPassword) {
        if (!formData.oldPassword) throw new Error("Masukkan password lama");
        if (!formData.newPassword) throw new Error("Masukkan password baru");
        if (formData.newPassword !== formData.confirmPassword)
          throw new Error("Konfirmasi password tidak cocok");

        // Validasi password lama
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const { data: loginData, error: loginError } =
          await supabase.auth.signInWithPassword({
            email: user.email,
            password: formData.oldPassword,
          });

        if (loginError || !loginData.session)
          throw new Error("Password lama salah!");

        // Update password
        const { error: pwError } = await supabase.auth.updateUser({
          password: formData.newPassword,
        });
        if (pwError) throw pwError;
      }

      setMessage({
        type: "success",
        text: "✅ Data berhasil disimpan!",
        time: Date.now(),
      });
      setEditing(false);
      fetchProfile();
      setFormData((prev) => ({
        ...prev,
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: err.message, time: Date.now() });
    }
  };

  return (
    <div className={styles.wrapper}>
      <main className={styles.main}>
        <h1 className={styles.title}>Edit Profil</h1>

        {message && (
          <Alert
            message={message.text}
            type={message.type}
            onClose={() => setMessage(null)}
          />
        )}

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className={styles.form}>
            {/* Nama */}
            <label>
              Nama
              <input
                type="text"
                value={formData.nama}
                onChange={(e) => handleChange(e, "nama")}
                disabled={!editing}
              />
            </label>

            {/* Password Lama */}
            <label>
              Password Lama
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword.old ? "text" : "password"}
                  value={formData.oldPassword}
                  onChange={(e) => handleChange(e, "oldPassword")}
                  disabled={!editing}
                />
                <span onClick={() => toggleShow("old")} className={styles.togglePassword}>
                  {showPassword.old ? <IoIosEyeOff /> : <IoMdEye />}
                </span>
              </div>
            </label>

            {/* Password Baru */}
            <label>
              Password Baru
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword.new ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={(e) => handleChange(e, "newPassword")}
                  disabled={!editing}
                />
                <span onClick={() => toggleShow("new")} className={styles.togglePassword}>
                  {showPassword.new ? <IoIosEyeOff /> : <IoMdEye />}
                </span>
              </div>
            </label>

            {/* Konfirmasi Password */}
            <label>
              Konfirmasi Password Baru
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword.confirm ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange(e, "confirmPassword")}
                  disabled={!editing}
                />
                <span
                  onClick={() => toggleShow("confirm")}
                  className={styles.togglePassword}
                >
                  {showPassword.confirm ? <IoIosEyeOff /> : <IoMdEye />}
                </span>
              </div>
            </label>

            {/* Tombol */}
            {!editing ? (
              <button className={styles.editBtn} onClick={() => setEditing(true)}>
                Edit
              </button>
            ) : (
              <button
                className={styles.saveBtn}
                onClick={handleSave}
                disabled={!hasChanges}
              >
                Simpan
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default EditProfil;
