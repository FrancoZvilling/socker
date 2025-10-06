// src/config/firebase.js
import { initializeApp } from "firebase/app";
import { initializeFirestore, CACHE_SIZE_UNLIMITED } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// --- INICIALIZACIÓN CENTRALIZADA ---
export const app = initializeApp(firebaseConfig);

// --- INICIALIZACIÓN DE SERVICIOS CON PERSISTENCIA ---
// Se utiliza 'initializeFirestore' para configurar la caché offline desde el principio
export const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED 
});

// El resto de las inicializaciones no cambian
export const auth = getAuth(app);
export const functions = getFunctions(app, 'southamerica-east1');



