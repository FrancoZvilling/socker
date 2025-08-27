// src/components/layout/Sidebar.jsx

import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { logout } from '../../services/authService';
import AuthModal from '../auth/AuthModal';
import { useBusiness } from '../../context/BusinessContext';
import {
  FiHome, FiBox, FiShoppingCart, FiBarChart2,
  FiTruck, FiUsers, FiLogIn, FiLogOut
} from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = () => {
  const { currentUser, userData, isLoading } = useAuth();
  const { businessData, isLoading: isBusinessLoading } = useBusiness();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // Por ahora, el nombre del negocio será estático, luego lo haremos dinámico.
  const businessName = "Mi Negocio"; 

  const handleLogout = async () => {
    try {
      await logout();
      // El AuthContext se encargará de actualizar el estado de la aplicación.
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const tenantName = isBusinessLoading 
    ? "Cargando..." 
    : businessData?.name || "Stocker";

  return (
    <> {/* Se usa un fragmento para que el Modal no esté dentro del <aside> */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h3>{tenantName}</h3>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" end>
            <FiHome /> <span>Dashboard</span>
          </NavLink>
          <NavLink to="/inventario">
            <FiBox /> <span>Inventario</span>
          </NavLink>
          <NavLink to="/ventas">
            <FiShoppingCart /> <span>Ventas</span>
          </NavLink>
          <NavLink to="/reportes">
            <FiBarChart2 /> <span>Reportes</span>
          </NavLink>
          <NavLink to="/proveedores">
            <FiTruck /> <span>Proveedores</span>
          </NavLink>
          <NavLink to="/clientes">
            <FiUsers /> <span>Clientes</span>
          </NavLink>
        </nav>
        
        {/* Sección inferior dinámica para la autenticación */}
        <div className="sidebar-footer">
          {isLoading ? (
            <div className="user-info loading">Cargando...</div>
          ) : currentUser ? (
            <div className="user-info">
              <span>{currentUser.email}</span>
              <button onClick={handleLogout} title="Cerrar Sesión">
                <FiLogOut />
              </button>
            </div>
          ) : (
            <button className="login-btn" onClick={() => setIsAuthModalOpen(true)}>
              <FiLogIn />
              <span>Iniciar Sesión / Registrarse</span>
            </button>
          )}
        </div>
      </aside>

      {/* El Modal se renderiza aquí, fuera del flujo visual del sidebar */}
      {isAuthModalOpen && (
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      )}
    </>
  );
};

export default Sidebar;