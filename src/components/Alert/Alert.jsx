import React, { useEffect, useState } from "react";
import { FiCheckCircle, FiAlertTriangle, FiXCircle } from "react-icons/fi";
import styles from "./Alert.module.css";

const Alert = ({ message, type = "error", duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) return;

    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      const removeTimer = setTimeout(() => {
        if (onClose) onClose();
        clearTimeout(removeTimer);
      }, 500);
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message || !visible) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <FiCheckCircle size={20} />;
      case "warning":
        return <FiAlertTriangle size={20} />;
      case "error":
      default:
        return <FiXCircle size={20} />;
    }
  };

  return (
    <div className={`${styles.alertContainer} ${styles[type]} ${visible ? styles.fadeIn : styles.fadeOut}`}>
      <span className={styles.icon}>{getIcon()}</span>
      <span>{message}</span>
    </div>
  );
};

export default Alert;
