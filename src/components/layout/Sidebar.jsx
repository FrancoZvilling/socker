import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiBox, FiShoppingCart, FiBarChart2, FiTruck, FiUsers } from 'react-icons/fi'; // Importamos íconos
import './Sidebar.css'; // Crearemos este archivo para los estilos

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>Mi Negocio</h3>
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
    </aside>
  );
};

export default Sidebar;