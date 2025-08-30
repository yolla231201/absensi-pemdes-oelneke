import React, { useState, useRef, useEffect } from "react";
import { FaSignOutAlt, FaCog, FaUserEdit, FaUserPlus  } from "react-icons/fa";
import { AiOutlineSetting,  AiOutlinePushpin, AiOutlineUsergroupAdd, AiOutlineUser, AiOutlineRollback } from "react-icons/ai";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
import RotatingText from "./RotatingText";
import styles from "./ProfileMenu.module.css";
import userPlaceholder from "../../../public/Logo_Kementerian.png";
import appLogo from "../../../public/dinas_ttu.png";

const ProfileMenu = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.profileMenuWrapper}>
      {/* Profile menu di atas konten hanya untuk desktop */}
      <div className={styles.profileMenu}>
        <div className={styles.appLogoWrapper}>
          <img src={appLogo.src} alt="Logo App" className={styles.appLogo} />
          <div className={styles.desaWrapper}>
            <span className={styles.desaStatic}>Desa</span>
            <RotatingText
              texts={["Oelneke", "KB", "Leluhur", "Lestari"]}
              mainClassName={styles.rotatingTextMain}
              staggerFrom={"last"}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-120%" }}
              staggerDuration={0.025}
              splitLevelClassName={styles.rotatingTextSplit}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              rotationInterval={2000}
            />
          </div>
        </div>

        <div className={styles.profileWrapper} ref={dropdownRef}>
          <img
            src={userPlaceholder.src}
            alt="User"
            className={styles.profilePhoto}
            onClick={() => setIsOpen((prev) => !prev)}
          />
          {isOpen && (
            <div className={styles.profileDropdown}>
              <img src={userPlaceholder.src} alt="User" className={styles.dropdownPhoto} />
              <div className={styles.userInfo}>
                <p className={styles.userName}>{user?.nama || "Nama User"}</p>
                <p className={styles.userEmail}>{user?.email || "email@example.com"}</p>
                <p className={styles.userRole}>{user?.jabatan || "Jabatan"}</p>
              </div>

              <div className={styles.dropdownMenu}>
                {user?.role === "kepala_desa" && (
                  <>
                    <button
                      className={styles.dropdownItem}
                      onClick={() => { router.push("/pengaturan"); setIsOpen(false); }}
                    >
                      <AiOutlineSetting /> Pengaturan
                    </button>
                    <button
                      className={styles.dropdownItem}
                      onClick={() => { router.push("/buat-pengumuman"); setIsOpen(false); }}
                    >
                      <AiOutlinePushpin /> Buat Pengumuman
                    </button>
                    <button
                      className={styles.dropdownItem}
                      onClick={() => { router.push("/tambah-pengguna"); setIsOpen(false); }}
                    >
                      <AiOutlineUsergroupAdd  /> Tambah Pengguna
                    </button>
                  </>
                )}

                <button
                  className={styles.dropdownItem}
                  onClick={() => { router.push("/edit-profil"); setIsOpen(false); }}
                >
                  <AiOutlineUser  /> Edit Profil
                </button>
              </div>

              <div className={styles.logoutButtonWrapper}>
                <button className={styles.logoutBtn} onClick={handleLogout}>
                <AiOutlineRollback  /> Logout
              </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileMenu;
