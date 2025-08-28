// src/services/authService.js

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, db, app } from '../config/firebase';
import { doc, setDoc, writeBatch, collection } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Iniciar Sesión (sin cambios)
export const login = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Cerrar Sesión (sin cambios)
export const logout = () => {
  return signOut(auth);
};

// Enviar email para reestablecer contraseña (sin cambios)
export const resetPassword = (email) => {
  return sendPasswordResetEmail(auth, email);
};

// Registrar un nuevo negocio (sin cambios)
export const registerNewBusiness = async (email, password, businessName) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  const batch = writeBatch(db);
  const tenantRef = doc(collection(db, 'tenants'));
  batch.set(tenantRef, {
    name: businessName,
    ownerUid: user.uid,
    createdAt: new Date(),
    subscriptionStatus: 'active',
  });
  const userRef = doc(db, 'users', user.uid);
  batch.set(userRef, {
    email: user.email,
    tenantId: tenantRef.id,
    role: 'admin',
  });
  await batch.commit();
  return user;
};


