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
      setBusinessData(null);
      setIsLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userData]);

  // Se añade la variable 'accountStatus' para una lectura más limpia.
  const accountStatus = businessData?.status || null;

  const value = {
    businessData,
    isLoading,
    // Se añade 'accountStatus' al objeto de valor que provee el contexto.
    accountStatus,
  };

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
};