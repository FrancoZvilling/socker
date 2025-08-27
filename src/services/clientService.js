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

// --- CAMBIO 1: Funciones auxiliares para obtener las referencias a las subcolecciones ---
// En lugar de una referencia fija, estas funciones construyen la ruta dinámicamente con el tenantId.
const getClientsCollectionRef = (tenantId) => collection(db, 'tenants', tenantId, 'clients');
const getPaymentsCollectionRef = (tenantId) => collection(db, 'tenants', tenantId, 'payments');


// --- CAMBIO 2: Todas las funciones exportadas ahora reciben 'tenantId' como primer parámetro ---

// CREATE: Añadir un nuevo cliente
export const addClient = (tenantId, clientData) => {
  return addDoc(getClientsCollectionRef(tenantId), { ...clientData, balance: 0, createdAt: new Date() });
};

// READ: Obtener todos los clientes en tiempo real
export const getClientsRealtime = (tenantId, callback) => {
  const q = query(getClientsCollectionRef(tenantId), orderBy('name')); // Ordenados por nombre
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const clients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(clients);
  });
  return unsubscribe;
};

// UPDATE: Actualizar un cliente existente
export const updateClient = (tenantId, id, clientData) => {
  const clientDoc = doc(db, 'tenants', tenantId, 'clients', id);
  return updateDoc(clientDoc, clientData);
};

// DELETE: Eliminar un cliente
export const deleteClient = (tenantId, id) => {
  const clientDoc = doc(db, 'tenants', tenantId, 'clients', id);
  return deleteDoc(clientDoc);
};

// Función para registrar un pago
export const registerClientPayment = async (tenantId, clientId, paymentAmount) => {
  // Obtenemos la referencia al documento del cliente dentro de su tenant
  const clientRef = doc(db, 'tenants', tenantId, 'clients', clientId);

  await runTransaction(db, async (transaction) => {
    const clientDoc = await transaction.get(clientRef);
    if (!clientDoc.exists()) {
      throw "¡El cliente no existe!";
    }

    const currentBalance = clientDoc.data().balance || 0;
    const newBalance = currentBalance - paymentAmount;

    // 1. Actualizamos el saldo del cliente
    transaction.update(clientRef, { balance: newBalance });

    // 2. Creamos un registro del pago en la colección 'payments' del tenant
    const paymentRecord = {
      clientId: clientId,
      clientName: clientDoc.data().name,
      amount: paymentAmount,
      previousBalance: currentBalance,
      newBalance: newBalance,
      timestamp: serverTimestamp(),
    };
    
    // Creamos una referencia para el nuevo documento de pago dentro de la subcolección del tenant
    const newPaymentRef = doc(getPaymentsCollectionRef(tenantId));
    transaction.set(newPaymentRef, paymentRecord);
  });
};