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
import logo from '../../assets/logo.png';
import ConnectionIndicator from '../common/ConnectionIndicator'; // Se importa el nuevo componente

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

  const handleProtectedLinkClick = (e) => {
    if (!hasAdminAccess()) {
      e.preventDefault(); 
    }
  };

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-header">
          {businessData ? (
             <h3>{tenantName}</h3>
          ) : (
            <img src={logo} alt="Stocker Logo" className="sidebar-logo" />
          )}
        </div>

        {currentUser && (
          <nav className="sidebar-nav">
            <NavLink 
              to="dashboard" 
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
            <NavLink to="/inventario"><FiBox /> <span>Inventario</span></NavLink>
            <NavLink to="/promociones"><FiGift /> <span>Promociones</span></NavLink>
            <NavLink to="/ventas"><FiShoppingCart /> <span>Ventas</span></NavLink>
            <NavLink to="/reportes"><FiBarChart2 /> <span>Reportes</span></NavLink>
            <NavLink to="/proveedores"><FiTruck /> <span>Proveedores</span></NavLink>
            <NavLink to="/clientes"><FiUsers /> <span>Clientes</span></NavLink>
            <NavLink to="/caja"><FiArchive /> <span>Caja</span></NavLink>
            <NavLink to="/configuracion" ><FiSettings /> <span>Configuración</span></NavLink>
          </nav>
        )}

        {/* --- La sección inferior se agrupa en un 'sidebar-bottom' --- */}
        <div className="sidebar-bottom">
          {currentUser && (
            <>
              {/* Se añade el indicador de conexión */}
              <div className="sidebar-connection-status">
                <ConnectionIndicator />
              </div>
              <div className="sidebar-switch-section">
                <AdminSwitch />
              </div>
            </>
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
        </div>
      </aside>

      {isAuthModalOpen && (
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      )}
    </>
  );
};

export default Sidebar;