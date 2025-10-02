// src/context/ConnectionContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

const ConnectionContext = createContext();

export const useConnection = () => {
  return useContext(ConnectionContext);
};

export const ConnectionProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true); // Asumimos online al principio

  useEffect(() => {
    // Firebase tiene una forma especial de detectar el estado de la conexión.
    // Escuchamos cambios en un documento especial '.info/connected'.
    const connectedRef = doc(db, '.info/connected');
    
    const unsubscribe = onSnapshot(connectedRef, (snap) => {
      // snap.data().value será 'true' si estamos conectados, 'false' si no.
      // Sin embargo, este método está más asociado a Realtime Database.
      // Un método más simple y universal es usar los eventos del navegador.
    });

    // --- MÉTODO MÁS SIMPLE Y EFECTIVO ---
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Verificamos el estado inicial
    setIsOnline(navigator.onLine);

    return () => {
      // unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const value = {
    isOnline,
  };

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
};