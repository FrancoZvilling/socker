// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import ROLES from '../config/permissions'; // Se importa la configuración de roles y permisos

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          setUserData(userDocSnap.data());
        } else {
          console.error("Error: Usuario autenticado no encontrado en la base de datos.");
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // Nueva función para verificar si el usuario actual tiene un permiso específico
  const hasPermission = (permission) => {
    if (!userData || !userData.role) {
      return false; // Si no hay datos de usuario o no tiene un rol, no tiene permisos.
    }
    
    const userRole = userData.role; // ej: 'admin' o 'vendedor'
    const userPermissions = ROLES[userRole]; // Se busca la lista de permisos para ese rol.

    if (!userPermissions) {
      return false; // Si el rol no existe en nuestra configuración, por seguridad no tiene permisos.
    }
    
    // Devuelve 'true' si el permiso solicitado está en la lista de permisos del usuario, 'false' si no.
    return userPermissions.includes(permission);
  };

  // Se añade la función 'hasPermission' al valor que provee el contexto
  const value = {
    currentUser,
    userData,
    isLoading,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};