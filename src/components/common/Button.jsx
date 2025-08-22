// src/components/common/Button.jsx
import React from 'react';
import './Button.css';

// --- 1. AÑADIMOS 'disabled' A LOS PROPS ---
const Button = ({ icon, children, onClick, type = 'primary', disabled }) => {
  const buttonClassName = `btn ${type}`;

  return (
    <button
      className={buttonClassName}
      onClick={onClick}
      disabled={disabled} // <-- 2. APLICAMOS EL PROP AL ELEMENTO HTML
    >
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;