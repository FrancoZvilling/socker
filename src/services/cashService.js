// src/services/cashService.js
import { db } from '../config/firebase';
import { collection, addDoc, onSnapshot, query, where, orderBy, doc, updateDoc, serverTimestamp, getDocs } from 'firebase/firestore';

// Función de ayuda para obtener la referencia a la subcolección de sesiones de caja
const getCashSessionsCollectionRef = (tenantId) => collection(db, 'tenants', tenantId, 'cash_sessions');

// Obtiene la última sesión de caja que esté 'open'
export const getActiveCashSessionRealtime = (tenantId, callback) => {
  const q = query(
    getCashSessionsCollectionRef(tenantId),
    where("status", "==", "open"),
    orderBy("openedAt", "desc")
  );
  
  return onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      callback(null); // No hay ninguna caja abierta
    } else {
      const session = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
      callback(session);
    }
  });
};

// Abre una nueva sesión de caja
export const openCashDrawer = (tenantId, openingAmount, user) => {
  return addDoc(getCashSessionsCollectionRef(tenantId), {
    status: 'open',
    openingAmount,
    openedAt: serverTimestamp(),
    openedBy: { uid: user.uid, email: user.email },
    // Campos que se llenarán al cerrar
    closedAt: null,
    closingAmount: null,
    expectedInCash: null,
    difference: null,
    closedBy: null,
    totalSalesInCash: 0, // Inicia en 0
  });
};

// Cierra una sesión de caja activa
export const closeCashDrawer = (tenantId, sessionId, closingAmount, expectedInCash, totalSalesInCash, user) => {
  const sessionRef = doc(db, 'tenants', tenantId, 'cash_sessions', sessionId);
  return updateDoc(sessionRef, {
    status: 'closed',
    closingAmount,
    expectedInCash,
    totalSalesInCash,
    difference: closingAmount - expectedInCash,
    closedAt: serverTimestamp(),
    closedBy: { uid: user.uid, email: user.email },
  });
};

// Obtiene la suma de las ventas en efectivo realizadas durante una sesión abierta
export const getCashSalesForActiveSession = async (tenantId, sessionStartDate) => {
  const salesCollectionRef = collection(db, 'tenants', tenantId, 'sales');
  const q = query(
    salesCollectionRef,
    where("createdAt", ">=", sessionStartDate),
    where("paymentMethod", "==", "cash")
  );

  const querySnapshot = await getDocs(q);
  let totalCashSales = 0;
  querySnapshot.forEach(doc => {
    totalCashSales += doc.data().total;
  });
  return totalCashSales;
};