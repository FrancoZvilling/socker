// src/layouts/MainLayout.jsx

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useBusiness } from '../context/BusinessContext'; // Se importa el hook de negocio
import LandingPage from '../pages/LandingPage';
import RequestAccountModal from '../components/auth/RequestAccountModal'; 
import './MainLayout.css';

const MainLayout = () => {
  const { currentUser, isLoading: isAuthLoading } = useAuth();
  // Se obtiene el estado de la cuenta desde el BusinessContext
  const { accountStatus, isLoading: isBusinessLoading } = useBusiness();
  
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  // Muestra un mensaje de carga mientras se verifica la autenticación Y los datos del negocio
  if (isAuthLoading || isBusinessLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Verificando...
      </div>
    );
  }

  // Función para decidir qué contenido renderizar en el área principal
  const renderContent = () => {
    // Si no hay usuario logueado, muestra la página de bienvenida
    if (!currentUser) {
      return <LandingPage onRequestAccount={() => setIsRequestModalOpen(true)} />;
    }

    // Si hay un usuario logueado, verifica el estado de su cuenta
    if (accountStatus === 'pending_approval') {
      return (
        <div className="status-overlay">
          <h2>Tu cuenta está pendiente de aprobación</h2>
          <p>Nos pondremos en contacto contigo a la brevedad para finalizar el proceso.</p>
        </div>
      );
    }
    
    if (accountStatus === 'suspended') {
      return (
        <div className="status-overlay">
          <h2>Tu cuenta ha sido suspendida</h2>
          <p>Por favor, contacta a soporte para regularizar tu situación y reactivar el servicio.</p>
        </div>
      );
    }
    
    // Si la cuenta está 'active' (o cualquier otro estado no bloqueante), muestra el contenido normal
    return <Outlet />;
  };

  return (
    <div className="main-layout">
      <Sidebar />
      <main className="main-content">
        {renderContent()}
      </main>
      
      {isRequestModalOpen && (
        <RequestAccountModal
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
        />
      )}
    </div>
  );
};

export default MainLayout;