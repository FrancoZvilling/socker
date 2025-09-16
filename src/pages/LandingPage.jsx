// src/pages/LandingPage.jsx
import React from 'react';
import Button from '../components/common/Button';
import { FiArrowRight } from 'react-icons/fi';
import './LandingPage.css';

// Pasaremos la función para abrir el modal de solicitud como un prop
const LandingPage = ({ onRequestAccount }) => {
  return (
    <div className="landing-page">
      <div className="landing-content">
        <h1>Bienvenido a Stocker</h1>
        <p className="subtitle">La solución simple y potente para gestionar el inventario de tu negocio.</p>
        <p className="description">
          Controla tu stock en tiempo real, procesa ventas rápidamente,
          gestiona tus clientes y proveedores, y obtén reportes claros sobre la
          salud de tu comercio. Todo en un solo lugar.
        </p>
        <Button onClick={onRequestAccount} type="primary">
          <span>Solicitar una Cuenta</span>
          <FiArrowRight />
        </Button>
      </div>
    </div>
  );
};

export default LandingPage;