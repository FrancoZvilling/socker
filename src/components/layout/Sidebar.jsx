// src/components/layout/Sidebar.jsx

import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAccess } from '../../context/AccessContext';
import { logout } from '../../services/authService';
import AuthModal from '../auth/AuthModal';
import { useBusiness } from '../../context/BusinessContext';
import {
  FiHome, FiBox, FiShoppingCart, FiBarChart2,
  FiTruck, FiUsers, FiLogIn, FiLogOut, FiGift, FiTrendingUp, FiArchive, FiSettings
} from 'react-icons/fi';
import './Sidebar.css';
import AdminSwitch from '../common/AdminSwitch';

const Sidebar = () => {
  const { currentUser, isLoading } = useAuth(); 
  const { hasAdminAccess } = useAccess();
  const { businessData, isLoading: isBusinessLoading } = useBusiness();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const tenantName = isBusinessLoading
    ? "Cargando..."
    : businessData?.name || "Stocker";

  // Función de ayuda que previene la navegación si no se tienen permisos
  const handleProtectedLinkClick = (e) => {
    if (!hasAdminAccess()) {
      // previene la navegación
      e.preventDefault(); 
    }
  };

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-header">
          <h3>{tenantName}</h3>
        </div>

        {currentUser && (
          <nav className="sidebar-nav">
            {/* --- LÓGICA DE PERMISOS CORREGIDA --- */}

            {/* Páginas Bloqueadas en Modo Empleado */}
            <NavLink 
              to="/" 
              end 
              className={!hasAdminAccess() ? 'disabled-link' : ''}
              onClick={handleProtectedLinkClick}
            >
              <FiHome /> <span>Dashboard</span>
            </NavLink>
            <NavLink 
              to="/finanzas" 
              className={!hasAdminAccess() ? 'disabled-link' : ''}
              onClick={handleProtectedLinkClick}
            >
              <FiTrendingUp /> <span>Finanzas</span>
            </NavLink>

            {/* Páginas Siempre Accesibles */}
            <NavLink to="/inventario"><FiBox /> <span>Inventario</span></NavLink>
            <NavLink to="/promociones"><FiGift /> <span>Promociones</span></NavLink>
            <NavLink to="/ventas"><FiShoppingCart /> <span>Ventas</span></NavLink>
            <NavLink to="/reportes"><FiBarChart2 /> <span>Reportes</span></NavLink>
            <NavLink to="/proveedores"><FiTruck /> <span>Proveedores</span></NavLink>
            <NavLink to="/clientes"><FiUsers /> <span>Clientes</span></NavLink>
            <NavLink to="/caja"><FiArchive /> <span>Caja</span></NavLink>
             <NavLink to="/configuracion" ><FiSettings /> <span>Configuración</span>
            </NavLink>
            
            
            
            
           
          </nav>
        )}
        {currentUser && (
          <div className="sidebar-switch-section">
            <AdminSwitch />
          </div>
        )}
        
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
              <span>Iniciar Sesión</span>
            </button>
          )}
        </div>
      </aside>

      {isAuthModalOpen && (
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      )}
    </>
  );
};

export default Sidebar;