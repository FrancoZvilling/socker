// src/services/saleService.js
import { db } from '../config/firebase';
import {
  collection, doc, writeBatch, serverTimestamp, query, orderBy,
  onSnapshot, Timestamp, where, increment
} from 'firebase/firestore';

// Funciones de ayuda para obtener las referencias a las subcolecciones
const getSalesCollectionRef = (tenantId) => collection(db, 'tenants', tenantId, 'sales');
const getMovementsCollectionRef = (tenantId) => collection(db, 'tenants', tenantId, 'movements');
const getProductsCollectionRef = (tenantId) => collection(db, 'tenants', tenantId, 'products');
const getClientsCollectionRef = (tenantId) => collection(db, 'tenants', tenantId, 'clients');

// Procesa una venta (ya adaptado para recibir tenantId implícitamente en el futuro)
export const processSale = async (tenantId, saleData, isCreditSale) => {
  const batch = writeBatch(db);
  const saleRecord = {
    items: saleData.items, total: saleData.total, client: saleData.client,
    createdAt: serverTimestamp(), paymentStatus: isCreditSale ? 'pending' : 'paid',
  };
  const newSaleRef = doc(getSalesCollectionRef(tenantId));
  batch.set(newSaleRef, saleRecord);

  if (isCreditSale && saleData.client) {
    const clientRef = doc(getClientsCollectionRef(tenantId), saleData.client.id);
    batch.update(clientRef, { balance: increment(saleData.total) });
  }

  for (const item of saleData.items) {
    const productRef = doc(getProductsCollectionRef(tenantId), item.id);
    const newStock = item.stock - item.quantity;
    batch.update(productRef, { stock: newStock });

    const movementData = {
      productId: item.id, productName: item.name, type: 'Venta',
      quantityChange: -item.quantity, previousStock: item.stock, newStock: newStock,
      timestamp: serverTimestamp(), clientId: saleData.client ? saleData.client.id : null,
      clientName: saleData.client ? saleData.client.name : 'Consumidor Final',
    };
    const newMovementRef = doc(getMovementsCollectionRef(tenantId));
    batch.set(newMovementRef, movementData);
  }
  await batch.commit();
};

// Obtiene todas las ventas
export const getSalesRealtime = (tenantId, callback, date = null) => {
  let q;
  if (date) {
    const [year, month, day] = date.split('-').map(Number);
    const startOfDay = new Date(year, month - 1, day);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
    q = query(
      getSalesCollectionRef(tenantId),
      where("createdAt", ">=", Timestamp.fromDate(startOfDay)),
      where("createdAt", "<=", Timestamp.fromDate(endOfDay)),
      orderBy("createdAt", "desc")
    );
  } else {
    q = query(getSalesCollectionRef(tenantId), orderBy("createdAt", "desc"));
  }
  return onSnapshot(q, (snapshot) => {
    const sales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(sales);
  });
};

// Obtiene las ventas de un cliente
export const getClientSalesRealtime = (tenantId, clientId, callback) => {
  const q = query(
    getSalesCollectionRef(tenantId),
    where("client.id", "==", clientId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const clientSales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(clientSales);
  });
};

// Obtiene las ventas de hoy para el dashboard
export const getTodaySalesRealtime = (tenantId, callback) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startTimestamp = Timestamp.fromDate(startOfToday);
  const q = query(getSalesCollectionRef(tenantId), where("createdAt", ">=", startTimestamp));
  return onSnapshot(q, (snapshot) => {
    const todaySales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(todaySales);
  });
};

// Obtiene las ventas de la semana para el dashboard
export const getWeekSalesRealtime = (tenantId, callback) => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const startOfWeek = new Date(today.getFullYear(), today.getMonth(), diff);
  startOfWeek.setHours(0, 0, 0, 0);
  const startTimestamp = Timestamp.fromDate(startOfWeek);
  const q = query(getSalesCollectionRef(tenantId), where("createdAt", ">=", startTimestamp));
  return onSnapshot(q, (snapshot) => {
    const weekSales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(weekSales);
  });
};

// Obtiene las ventas del mes para el dashboard
export const getMonthSalesRealtime = (tenantId, callback) => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);
  const startTimestamp = Timestamp.fromDate(startOfMonth);
  const q = query(getSalesCollectionRef(tenantId), where("createdAt", ">=", startTimestamp));
  return onSnapshot(q, (snapshot) => {
    const monthSales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(monthSales);
  });
};
