// src/services/clientService.js
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
  runTransaction,
  serverTimestamp
} from 'firebase/firestore';

const clientsCollectionRef = collection(db, 'clients');
const paymentsCollectionRef = collection(db, 'payments');

// CREATE: Añadir un nuevo cliente
export const addClient = (clientData) => {
  return addDoc(clientsCollectionRef, { ...clientData, balance: 0, createdAt: new Date() });
};

// READ: Obtener todos los clientes en tiempo real
export const getClientsRealtime = (callback) => {
  const q = query(clientsCollectionRef, orderBy('name')); // Ordenados por nombre
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const clients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(clients);
  });
  return unsubscribe;
};

// UPDATE: Actualizar un cliente existente
export const updateClient = (id, clientData) => {
  const clientDoc = doc(db, 'clients', id);
  return updateDoc(clientDoc, clientData);
};

// DELETE: Eliminar un cliente
export const deleteClient = (id) => {
  const clientDoc = doc(db, 'clients', id);
  return deleteDoc(clientDoc);
};

// --- 4. NUEVA FUNCIÓN PARA REGISTRAR UN PAGO ---
export const registerClientPayment = async (clientId, paymentAmount) => {
  // Obtenemos la referencia al documento del cliente
  const clientRef = doc(db, 'clients', clientId);

  // runTransaction nos da una "foto" segura del estado actual
  await runTransaction(db, async (transaction) => {
    // Primero, leemos el estado actual del cliente DENTRO de la transacción
    const clientDoc = await transaction.get(clientRef);
    if (!clientDoc.exists()) {
      throw "¡El cliente no existe!";
    }

    // Calculamos el nuevo saldo
    const currentBalance = clientDoc.data().balance || 0;
    const newBalance = currentBalance - paymentAmount;

    // A continuación, preparamos las escrituras
    
    // 1. Actualizamos el saldo del cliente
    transaction.update(clientRef, { balance: newBalance });

    // 2. Creamos un registro del pago en la colección 'payments'
    const paymentRecord = {
      clientId: clientId,
      clientName: clientDoc.data().name, // Guardamos el nombre para facilitar reportes
      amount: paymentAmount,
      previousBalance: currentBalance,
      newBalance: newBalance,
      timestamp: serverTimestamp(),
    };
    
    // Creamos una referencia para el nuevo documento de pago
    const newPaymentRef = doc(paymentsCollectionRef);
    transaction.set(newPaymentRef, paymentRecord);
  });
};