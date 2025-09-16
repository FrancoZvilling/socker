// src/services/authService.js
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, writeBatch, collection, getDoc, updateDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions } from '../config/firebase'; // Importa 'functions'

export const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const logout = () => signOut(auth);
export const resetPassword = (email) => sendPasswordResetEmail(auth, email);
export const registerNewBusiness = async (email, password, businessName) => { /* ... (código sin cambios) ... */ };

export const requestNewAccount = (formData) => {
  const sendRequest = httpsCallable(functions, 'requestNewTenant');
  return sendRequest({
    businessName: formData.businessName,
    email: formData.email,
    whatsapp: formData.whatsapp,
  });
};

// --- FUNCIÓN RENOMBRADA PARA COINCIDIR CON LA IMPORTACIÓN ---
export const activateTenantAfterRegistration = async (userId) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error("No se encontró el registro de usuario correspondiente para la activación.");
  }

  const tenantId = userSnap.data().tenantId;
  if (!tenantId) {
    throw new Error("El usuario no está asociado a ningún negocio.");
  }

  const tenantRef = doc(db, 'tenants', tenantId);
  await updateDoc(tenantRef, {
    status: 'active'
  });

  console.log(`Tenant ${tenantId} activado con éxito por el usuario ${userId}.`);
};

