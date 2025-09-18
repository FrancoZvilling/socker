// src/components/common/LoadingOverlay.jsx
import React from 'react';
import './LoadingOverlay.css';

const LoadingOverlay = ({ message }) => {
  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="spinner"></div>
        <p className="loading-message">{message}</p>
        <p className="loading-submessage">
          No se asuste, esta operación puede tardar varios minutos.
          <br />
          Por favor, no cierre esta ventana.
        </p>
      </div>
    </div>
  );
};

export default LoadingOverlay;