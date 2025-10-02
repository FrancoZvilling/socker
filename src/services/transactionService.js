// src/services/transactionService.js
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
  where
} from 'firebase/firestore';

// Función de ayuda para obtener la referencia a la subcolección 'transactions'
const getTransactionsCollectionRef = (tenantId) => collection(db, 'tenants', tenantId, 'transactions');

// CREATE: Añadir una nueva transacción (ingreso o egreso)
export const addTransaction = (tenantId, transactionData) => {
  // Nos aseguramos de guardar la fecha de vencimiento como un Timestamp de Firebase
  const dataToSave = {
    ...transactionData,
    dueDate: new Date(transactionData.dueDate + 'T00:00:00'), // Asegura la fecha correcta
    createdAt: new Date(),
  };
  return addDoc(getTransactionsCollectionRef(tenantId), dataToSave);
};

// READ: Obtener todas las transacciones pendientes en tiempo real
export const getPendingTransactionsRealtime = (tenantId, callback) => {
  const q = query(
    getTransactionsCollectionRef(tenantId),
    where("status", "==", "pending"),
    orderBy("dueDate", "asc") // Ordenadas por la fecha de vencimiento más próxima
  );
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(transactions);
  });
  return unsubscribe;
};

// --- FUNCIÓN 'updateTransaction' CORREGIDA ---
// Ahora se asegura de convertir la fecha si es una cadena de texto.
export const updateTransaction = (tenantId, id, dataToUpdate) => {
  const transactionDoc = doc(db, 'tenants', tenantId, 'transactions', id);
  
  const finalData = { ...dataToUpdate };

  // Si en los datos a actualizar viene 'dueDate' y es de tipo 'string',
  // lo convertimos a un objeto Date para que Firebase lo guarde como Timestamp.
  if (finalData.dueDate && typeof finalData.dueDate === 'string') {
    finalData.dueDate = new Date(finalData.dueDate + 'T00:00:00');
  }

  return updateDoc(transactionDoc, finalData);
};
// ---------------------------------------------

// DELETE: Eliminar una transacción
export const deleteTransaction = (tenantId, id) => {
  const transactionDoc = doc(db, 'tenants', tenantId, 'transactions', id);
  return deleteDoc(transactionDoc);
};