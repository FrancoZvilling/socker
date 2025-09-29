// src/components/dashboard/DashboardCard.jsx
import React from 'react';
import './DashboardCard.css';

// --- 1. AÑADIMOS 'color' A LOS PROPS ---
const DashboardCard = ({ title, value, icon, isLoading, color = 'default' }) => {
  return (
    <div className="dashboard-card">
      <div className="card-icon">{icon}</div>
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        {isLoading ? (
          <p className="card-value loading">Cargando...</p>
        ) : (
          // --- 2. APLICAMOS LA CLASE DE COLOR DINÁMICAMENTE ---
          <p className={`card-value ${color}`}>
            {value}
          </p>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;