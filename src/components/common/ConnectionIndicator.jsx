// src/components/common/ConnectionIndicator.jsx
import React from 'react';
import { useConnection } from '../../context/ConnectionContext';
import { FiWifi, FiWifiOff } from 'react-icons/fi';
import './ConnectionIndicator.css';

const ConnectionIndicator = () => {
  const { isOnline } = useConnection();

  if (isOnline) {
    return (
      <div className="connection-indicator online" title="Conectado">
        <FiWifi />
        <span>En Línea</span>
      </div>
    );
  }

  return (
    <div className="connection-indicator offline" title="Sin conexión. Tus cambios se guardarán localmente.">
      <FiWifiOff />
      <span>Sin Conexión</span>
    </div>
  );
};
export default ConnectionIndicator;