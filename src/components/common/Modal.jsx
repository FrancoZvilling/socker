// src/components/common/Modal.jsx
import React from 'react';
import { FiX } from 'react-icons/fi';
import './Modal.css';

const Modal = ({ isOpen, onClose, title, children }) => {
  // Si isOpen es false, no renderizamos nada.
  if (!isOpen) {
    return null;
  }

  return (
    // El "portal" o fondo oscuro
    <div className="modal-overlay" onClick={onClose}>
      {/* El contenido del modal. Usamos onClick con stopPropagation
          para evitar que un clic dentro del modal lo cierre. */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;