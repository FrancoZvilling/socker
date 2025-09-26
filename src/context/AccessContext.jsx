// src/context/AccessContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useBusiness } from './BusinessContext';
import bcrypt from 'bcryptjs';
import Swal from 'sweetalert2';

const AccessContext = createContext();

export const useAccess = () => {
  return useContext(AccessContext);
};

export const AccessProvider = ({ children }) => {
  const { currentUser, isLoading: isAuthLoading } = useAuth(); // Se obtiene también el estado de carga
  const { businessData } = useBusiness();
  
  const [accessMode, setAccessMode] = useState(
    () => sessionStorage.getItem('accessMode') || 'employee'
  );

  useEffect(() => {
    sessionStorage.setItem('accessMode', accessMode);
  }, [accessMode]);
  
  // --- useEffect MODIFICADO ---
  // Este efecto ahora solo actúa cuando el estado de carga de la autenticación cambia.
  useEffect(() => {
    // Si la carga ha terminado Y no hay un usuario (lo que significa que cerró sesión
    // o nunca inició una), entonces reseteamos el modo.
    if (!isAuthLoading && !currentUser) {
      setAccessMode('employee');
    }
    
    // No reseteamos el modo si 'currentUser' es nulo solo porque 'isAuthLoading' es true.
  }, [currentUser, isAuthLoading]); // Depende de ambos estados

  const switchToAdminMode = async () => {
    if (!businessData?.adminPinHash) {
      Swal.fire('PIN no configurado', 'El administrador del negocio aún no ha establecido un PIN de seguridad.', 'warning');
      return;
    }

    const { value: pin } = await Swal.fire({
      title: 'Ingresar PIN de Administrador',
      input: 'password',
      inputLabel: 'Introduce el PIN de 4 dígitos para acceder a las funciones de administrador.',
      inputPlaceholder: '****',
      inputAttributes: {
        maxLength: 4,
        autocapitalize: 'off',
        autocorrect: 'off',
        inputMode: 'numeric',
        pattern: '[0-9]*'
      },
      showCancelButton: true,
      confirmButtonText: 'Desbloquear',
      cancelButtonText: 'Cancelar'
    });

    if (pin) {
      const isMatch = await bcrypt.compare(pin, businessData.adminPinHash);
      if (isMatch) {
        setAccessMode('admin');
        Swal.fire('¡Modo Administrador Activado!', '', 'success');
      } else {
        Swal.fire('PIN Incorrecto', '', 'error');
      }
    }
  };

  const switchToEmployeeMode = () => {
    setAccessMode('employee');
  };

  const hasAdminAccess = () => {
    return accessMode === 'admin';
  };

  const value = {
    accessMode,
    hasAdminAccess,
    switchToAdminMode,
    switchToEmployeeMode,
  };

  return (
    <AccessContext.Provider value={value}>
      {children}
    </AccessContext.Provider>
  );
};