// src/routes/SuperAdminRoute.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const SuperAdminRoute = ({ children }) => {
  const { userData, isLoading } = useAuth();

  if (isLoading) {
    return <div>Verificando permisos...</div>;
  }

  // Si el usuario NO es un super_admin, lo redirigimos al dashboard normal
  if (userData?.role !== 'super_admin') {
    return <Navigate to="/" />;
  }

  // Si es un super_admin, le mostramos la página
  return children;
};

export default SuperAdminRoute;