// src/services/saleService.js
import { db } from '../config/firebase';
import {
  collection,
  doc,
  writeBatch,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  where,
  increment,
  getDocs,
  limit,
  // Ya no necesitamos offset ni getCountFromServer
} from 'firebase/firestore';

const getSalesCollectionRef = (tenantId) => collection(db, 'tenants', tenantId, 'sales');
const getMovementsCollectionRef = (tenantId) => collection(db, 'tenants', tenantId, 'movements');
const getProductsCollectionRef = (tenantId) => collection(db, 'tenants', tenantId, 'products');
const getClientsCollectionRef = (tenantId) => collection(db, 'tenants', tenantId, 'clients');

export const processSale = async (tenantId, saleData, isCreditSale, paymentMethod) => {
  const batch = writeBatch(db);
  const productsSnapshot = await getDocs(getProductsCollectionRef(tenantId));
  const productsDataMap = new Map(productsSnapshot.docs.map(doc => [doc.id, doc.data()]));
  const itemsWithCost = saleData.items.map(item => {
    let calculatedCostPrice = 0;
    if (item.type === 'product') {
      calculatedCostPrice = item.costPrice || 0;
    } else if (item.type === 'combo') {
      calculatedCostPrice = item.components.reduce((sum, component) => {
        const productDetails = productsDataMap.get(component.productId);
        const componentCost = productDetails ? productDetails.costPrice || 0 : 0;
        return sum + (componentCost * component.quantity);
      }, 0);
    }
    return { ...item, costPrice: calculatedCostPrice };
  });
  const totalCost = itemsWithCost.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);
  const profit = saleData.total - totalCost;
  const saleRecord = {
    items: itemsWithCost,
    total: saleData.total,
    totalCost: totalCost,
    profit: profit,
    client: saleData.client,
    createdAt: serverTimestamp(),
    paymentStatus: isCreditSale ? 'pending' : 'paid',
    paymentMethod: isCreditSale ? 'credit' : paymentMethod,
  };
  const newSaleRef = doc(getSalesCollectionRef(tenantId));
  batch.set(newSaleRef, saleRecord);
  if (isCreditSale && saleData.client) {
    const clientRef = doc(getClientsCollectionRef(tenantId), saleData.client.id);
    batch.update(clientRef, { balance: increment(saleData.total) });
  }
  for (const item of saleData.items) {
    if (item.type === 'product') {
      const productRef = doc(getProductsCollectionRef(tenantId), item.id);
      batch.update(productRef, { stock: increment(-item.quantity) });
      const movementData = { productId: item.id, productName: item.name, type: 'Venta', quantityChange: -item.quantity, timestamp: serverTimestamp(), saleId: newSaleRef.id };
      const newMovementRef = doc(getMovementsCollectionRef(tenantId));
      batch.set(newMovementRef, movementData);
    } 
    else if (item.type === 'combo') {
      for (const component of item.components) {
        const productRef = doc(getProductsCollectionRef(tenantId), component.productId);
        const quantityToDecrement = component.quantity * item.quantity;
        batch.update(productRef, { stock: increment(-quantityToDecrement) });
        const movementData = { productId: component.productId, productName: component.productName, type: `Venta (Combo: ${item.name})`, quantityChange: -quantityToDecrement, timestamp: serverTimestamp(), saleId: newSaleRef.id };
        const newMovementRef = doc(getMovementsCollectionRef(tenantId));
        batch.set(newMovementRef, movementData);
      }
    }
  }
  await batch.commit();
};

// Se elimina 'getSalesPaginated' y se reemplaza con las dos funciones necesarias.

export const getClientSalesRealtime = (tenantId, clientId, callback) => {
  const q = query(getSalesCollectionRef(tenantId), where("client.id", "==", clientId), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const clientSales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(clientSales);
  });
};

export const getTodaySalesRealtime = (tenantId, callback) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startTimestamp = Timestamp.fromDate(startOfToday);
  const q = query(
    getSalesCollectionRef(tenantId),
    where("createdAt", ">=", startTimestamp),
    orderBy("createdAt", "desc") // Se añade el orden para consistencia
  );
  return onSnapshot(q, (snapshot) => {
    const todaySales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(todaySales);
  });
};

// --- NUEVA FUNCIÓN PARA BÚSQUEDA POR RANGO ---
export const getSalesByDateRange = async (tenantId, startDate, endDate) => {
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T23:59:59');

  const q = query(
    getSalesCollectionRef(tenantId),
    where("createdAt", ">=", Timestamp.fromDate(start)),
    where("createdAt", "<=", Timestamp.fromDate(end)),
    orderBy("createdAt", "desc")
  );

  const querySnapshot = await getDocs(q);
  const sales = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return sales;
};


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

export const getSalesForLastNDays = (tenantId, numberOfDays, callback) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (numberOfDays - 1));
  startDate.setHours(0, 0, 0, 0);
  const startTimestamp = Timestamp.fromDate(startDate);
  const q = query(
    getSalesCollectionRef(tenantId),
    where("createdAt", ">=", startTimestamp),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(q, (snapshot) => {
    const sales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(sales);
  });
};