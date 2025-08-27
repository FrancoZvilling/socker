// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth'; // Observador de Auth
import { doc, getDoc } from 'firebase/firestore'; // Para leer documentos de Firestore
import { auth, db } from '../config/firebase'; // Asegúrate de exportar 'db' y 'auth' desde tu config

// Creamos los contextos
const AuthContext = createContext();

// Hook personalizado para usar el contexto fácilmente
export const useAuth = () => {
  return useContext(AuthContext);
};

// El proveedor que envolverá nuestra aplicación
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); // Para el usuario de Firebase Auth
  const [userData, setUserData] = useState(null); // Para nuestros datos de Firestore (rol, tenantId)
  const [isLoading, setIsLoading] = useState(true); // Para saber si estamos verificando la sesión

  useEffect(() => {
    // onAuthStateChanged es un listener que se ejecuta cuando el estado de auth cambia (login/logout)
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user); // Guardamos el usuario de Auth (o null)
      
      if (user) {
        // Si hay un usuario, vamos a buscar sus datos en nuestra colección 'users'
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          // Si encontramos el documento, guardamos sus datos (rol, tenantId)
          setUserData(userDocSnap.data());
        } else {
          // Esto podría pasar si un usuario existe en Auth pero no en nuestra DB.
          // Es un caso de error que deberíamos manejar.
          console.error("Error: Usuario autenticado no encontrado en la base de datos.");
          setUserData(null);
        }
      } else {
        // Si no hay usuario, limpiamos nuestros datos
        setUserData(null);
      }
      
      setIsLoading(false); // Terminamos de cargar
    });

    // Limpiamos el listener al desmontar el componente para evitar fugas de memoria
    return unsubscribe;
  }, []);

  // Los valores que proveeremos a toda la aplicación
  const value = {
    currentUser,
    userData,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};