// src/components/common/AdminSwitch.jsx
import React from 'react';
import { useAccess } from '../../context/AccessContext';
import { FiLock, FiUnlock } from 'react-icons/fi';
import './AdminSwitch.css';

const AdminSwitch = () => {
  const { accessMode, switchToAdminMode, switchToEmployeeMode } = useAccess();
  const isAdmin = accessMode === 'admin';

  const handleChange = () => {
    if (isAdmin) {
      switchToEmployeeMode();
    } else {
      switchToAdminMode();
    }
  };

  return (
    <div className="admin-switch-container">
      <label htmlFor="admin-switch" className="switch-label">
        {isAdmin ? <FiUnlock /> : <FiLock />}
        <span>Modo {isAdmin ? 'Administrador' : 'Empleado'}</span>
      </label>
      <label className="switch">
        <input 
          id="admin-switch"
          type="checkbox"
          checked={isAdmin}
          onChange={handleChange}
        />
        <span className="slider round"></span>
      </label>
    </div>
  );
};
export default AdminSwitch;