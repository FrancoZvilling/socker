// src/context/ConnectionContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
// Ya no se necesitan importaciones de 'firebase/firestore' en este archivo.

const ConnectionContext = createContext();

export const useConnection = () => {
  return useContext(ConnectionContext);
};

export const ConnectionProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Se ha eliminado la lógica de 'onSnapshot' a '.info/connected' que causaba el error de permisos.

    // Se mantiene únicamente el método del navegador, que es simple y efectivo.
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Se establece el estado inicial basado en el navegador.
    setIsOnline(navigator.onLine);

    return () => {
      // Se limpia solo los listeners del navegador.
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []); // El array de dependencias vacío es correcto.

  const value = {
    isOnline,
  };

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
};