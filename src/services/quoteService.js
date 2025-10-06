// src/services/quoteService.js
import { db } from '../config/firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore';

const getQuotesCollectionRef = (tenantId) => collection(db, 'tenants', tenantId, 'quotes');

// --- FUNCIONES CRUD COMPLETADAS ---

// CREATE: Añadir un nuevo presupuesto
export const addQuote = (tenantId, quoteData) => {
  const dataToSave = {
    ...quoteData,
    createdAt: new Date(),
    // Podríamos añadir un número de presupuesto aquí si quisiéramos
  };
  return addDoc(getQuotesCollectionRef(tenantId), dataToSave);
};

// UPDATE: Actualizar un presupuesto existente
export const updateQuote = (tenantId, id, data) => {
  const quoteDoc = doc(db, 'tenants', tenantId, 'quotes', id);
  return updateDoc(quoteDoc, data);
};

// DELETE: Eliminar un presupuesto
export const deleteQuote = (tenantId, id) => {
  const quoteDoc = doc(db, 'tenants', tenantId, 'quotes', id);
  return deleteDoc(quoteDoc);
};


// --- FUNCIONES PARA EL HISTORIAL (SIN CAMBIOS) ---

export const getTodayQuotesRealtime = (tenantId, callback) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startTimestamp = Timestamp.fromDate(startOfToday);
  const q = query(
    getQuotesCollectionRef(tenantId),
    where("createdAt", ">=", startTimestamp),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const quotes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(quotes);
  });
};

export const getQuotesByDateRange = async (tenantId, startDate, endDate) => {
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T23:59:59');
  const q = query(
    getQuotesCollectionRef(tenantId),
    where("createdAt", ">=", Timestamp.fromDate(start)),
    where("createdAt", "<=", Timestamp.fromDate(end)),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  const quotes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return quotes;
};