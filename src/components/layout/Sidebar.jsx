// src/components/layout/Sidebar.jsx

import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { logout } from '../../services/authService';
import AuthModal from '../auth/AuthModal';
import { useBusiness } from '../../context/BusinessContext';
import { PERMISSIONS } from '../../config/permissions';
import {
  FiHome, FiBox, FiShoppingCart, FiBarChart2,
  FiTruck, FiUsers, FiLogIn, FiLogOut, FiGift, FiTrendingUp, FiArchive
} from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = () => {
  const { currentUser, isLoading, hasPermission } = useAuth();
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

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-header">
          <h3>{tenantName}</h3>
        </div>

        {currentUser && (
          <nav className="sidebar-nav">
            <NavLink to="/" end>
              <FiHome /> <span>Dashboard</span>
            </NavLink>

            {hasPermission(PERMISSIONS.VIEW_INVENTORY) && (
              <NavLink to="/inventario">
                <FiBox /> <span>Inventario</span>
              </NavLink>
            )}

            {/* Se añade el nuevo enlace a Promociones */}
            {hasPermission(PERMISSIONS.MANAGE_PRODUCTS) && (
              <NavLink to="/promociones">
                <FiGift /> <span>Promociones</span>
              </NavLink>
            )}

            {hasPermission(PERMISSIONS.USE_POS) && (
              <NavLink to="/ventas">
                <FiShoppingCart /> <span>Ventas</span>
              </NavLink>
            )}

            {hasPermission(PERMISSIONS.VIEW_REPORTS) && (
              <NavLink to="/reportes">
                <FiBarChart2 /> <span>Reportes</span>
              </NavLink>
            )}

            {hasPermission(PERMISSIONS.MANAGE_SUPPLIERS) && (
              <NavLink to="/proveedores">
                <FiTruck /> <span>Proveedores</span>
              </NavLink>
            )}

            {hasPermission(PERMISSIONS.MANAGE_CLIENTS) && (
              <NavLink to="/clientes">
                <FiUsers /> <span>Clientes</span>
              </NavLink>
            )}
            <NavLink to="/finanzas">
              <FiTrendingUp /> <span>Finanzas</span>
            </NavLink>
            <NavLink to="/caja">
              <FiArchive /> <span>Caja</span>
            </NavLink>
          </nav>
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