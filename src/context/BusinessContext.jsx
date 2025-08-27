// src/context/BusinessContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext'; // Depende de la sesión del usuario
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

const BusinessContext = createContext();

export const useBusiness = () => {
  return useContext(BusinessContext);
};

export const BusinessProvider = ({ children }) => {
  const { userData } = useAuth(); // Obtenemos los datos del usuario logueado
  const [businessData, setBusinessData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubscribe;
    const tenantId = userData?.tenantId;

    if (tenantId) {
      setIsLoading(true);
      // Si tenemos un tenantId, nos suscribimos a los cambios de ese negocio
      const businessDocRef = doc(db, 'tenants', tenantId);
      unsubscribe = onSnapshot(businessDocRef, (docSnap) => {
        if (docSnap.exists()) {
          setBusinessData({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.error("Error: No se encontró el negocio (tenant) asociado.");
          setBusinessData(null);
        }
        setIsLoading(false);
      });
    } else {
      // Si no hay tenantId (nadie logueado), reseteamos los datos
      setBusinessData(null);
      setIsLoading(false);
    }

    // Limpiamos la suscripción al desmontar o si el tenantId cambia
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userData]); // Este efecto depende de los datos del usuario

  const value = {
    businessData,
    isLoading,
  };

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
};