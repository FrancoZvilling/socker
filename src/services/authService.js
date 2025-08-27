// src/services/authService.js

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail // Para la funcionalidad de "Olvidé mi contraseña"
} from 'firebase/auth';
import { auth } from '../config/firebase'; // Importamos la instancia de auth desde nuestra config
import { doc, setDoc, writeBatch, collection } from 'firebase/firestore';
    import { db } from '../config/firebase';

// Iniciar Sesión
export const login = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Cerrar Sesión
export const logout = () => {
  return signOut(auth);
};

// Registrar un nuevo usuario (solo en Auth, la lógica de la DB irá en otro lado)
export const registerUserInAuth = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// Enviar email para reestablecer contraseña
export const resetPassword = (email) => {
  return sendPasswordResetEmail(auth, email);
};

export const registerNewBusiness = async (email, password, businessName) => {
      // 1. Crea el usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Prepara una escritura por lotes para asegurar que todo se cree junto
      const batch = writeBatch(db);

      // 3. Crea el documento del nuevo negocio (tenant)
      const tenantRef = doc(collection(db, 'tenants')); // Crea una referencia con ID automático
      batch.set(tenantRef, {
        name: businessName,
        ownerUid: user.uid,
        createdAt: new Date(),
        subscriptionStatus: 'active', // Estado inicial
      });

      // 4. Crea el documento del usuario en nuestra colección 'users'
      const userRef = doc(db, 'users', user.uid); // Usa el UID de Auth como ID
      batch.set(userRef, {
        email: user.email,
        tenantId: tenantRef.id, // Vincula el usuario al nuevo tenant
        role: 'admin',
      });

      // 5. Ejecuta todas las operaciones. Si algo falla, nada se guarda.
      await batch.commit();

      // Devuelve el usuario para que la app pueda iniciar sesión automáticamente
      return user;
    };