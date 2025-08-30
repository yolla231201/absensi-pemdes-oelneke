// Komponen SimpleAlert.jsx
import React from "react";

const SimpleAlert = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        padding: "1rem 1.5rem",
        backgroundColor: "#f44336",
        color: "#fff",
        borderRadius: "0.5rem",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        zIndex: 9999,
      }}
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          marginLeft: "1rem",
          background: "transparent",
          border: "none",
          color: "#fff",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        ×
      </button>
    </div>
  );
};

export default SimpleAlert;
