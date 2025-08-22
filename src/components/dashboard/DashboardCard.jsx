// src/components/dashboard/DashboardCard.jsx
import React from 'react';
import './DashboardCard.css';

const DashboardCard = ({ title, value, icon, isLoading }) => {
  return (
    <div className="dashboard-card">
      <div className="card-icon">{icon}</div>
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        {isLoading ? (
          <p className="card-value loading">Cargando...</p>
        ) : (
          <p className="card-value">{value}</p>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;