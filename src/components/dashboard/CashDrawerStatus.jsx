// src/components/dashboard/CashDrawerStatus.jsx
import React from 'react';
import Button from '../common/Button';
import { FiBox } from 'react-icons/fi';
import './CashDrawerStatus.css';

const CashDrawerStatus = ({ activeSession, isLoading, onOpen, onClose }) => {
  if (isLoading) {
    return <div className="cash-drawer-card loading">Cargando estado de caja...</div>;
  }

  return (
    <div className={`cash-drawer-card ${activeSession ? 'open' : 'closed'}`}>
      <div className="card-icon"><FiBox /></div>
      <div className="card-content">
        <h3 className="card-title">Estado de la Caja</h3>
        {activeSession ? (
          <>
            <p className="card-value">CAJA ABIERTA</p>
            <span className="card-subtitle">Abierta por: {activeSession.openedBy.email}</span>
            <Button onClick={onClose} type="primary">Cerrar Caja</Button>
          </>
        ) : (
          <>
            <p className="card-value">CAJA CERRADA</p>
            <span className="card-subtitle">Inicia un nuevo turno de ventas.</span>
            <Button onClick={onOpen} type="primary">Abrir Caja</Button>
          </>
        )}
      </div>
    </div>
  );
};

export default CashDrawerStatus;