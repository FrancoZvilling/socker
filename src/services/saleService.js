// src/services/saleService.js
import { db, auth } from '../config/firebase';
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
  getDocs // Se añade 'getDocs' a la lista de importaciones
} from 'firebase/firestore';

const getSalesCollectionRef = (tenantId) => collection(db, 'tenants', tenantId, 'sales');
const getMovementsCollectionRef = (tenantId) => collection(db, 'tenants', tenantId, 'movements');
const getProductsCollectionRef = (tenantId) => collection(db, 'tenants', tenantId, 'products');
const getClientsCollectionRef = (tenantId) => collection(db, 'tenants', tenantId, 'clients');

// --- FUNCIÓN processSale MODIFICADA Y COMPLETA ---
export const processSale = async (tenantId, saleData, isCreditSale, paymentMethod) => {
  const batch = writeBatch(db);

  // 1. Obtenemos una 'foto' actual de todos los productos para tener sus precios de costo
  const productsSnapshot = await getDocs(getProductsCollectionRef(tenantId));
  const productsDataMap = new Map(productsSnapshot.docs.map(doc => [doc.id, doc.data()]));

  // 2. Enriquecemos los items del carrito con el 'costPrice' correcto
  const itemsWithCost = saleData.items.map(item => {
    let calculatedCostPrice = 0;
    if (item.type === 'product') {
      // Para un producto, su costo es el que ya tiene
      calculatedCostPrice = item.costPrice || 0;
    } else if (item.type === 'combo') {
      // Para un combo, calculamos la suma de los costos de sus componentes
      calculatedCostPrice = item.components.reduce((sum, component) => {
        const productDetails = productsDataMap.get(component.productId);
        const componentCost = productDetails ? productDetails.costPrice || 0 : 0;
        return sum + (componentCost * component.quantity);
      }, 0);
    }
    return { ...item, costPrice: calculatedCostPrice };
  });

  // 3. Calculamos los totales finales con los costos ya enriquecidos
  const totalCost = itemsWithCost.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);
  const profit = saleData.total - totalCost;

  // 4. Creamos el registro de la venta con todos los datos correctos
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

  // 5. El resto de la lógica (ajuste de saldo y descuento de stock) se mantiene igual
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


// --- EL RESTO DE LAS FUNCIONES NO HAN SIDO MODIFICADAS ---

export const getSalesRealtime = (tenantId, callback, date = null) => {
  let q;
  if (date) {
    const [year, month, day] = date.split('-').map(Number);
    const startOfDay = new Date(year, month - 1, day);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
    q = query(getSalesCollectionRef(tenantId), where("createdAt", ">=", Timestamp.fromDate(startOfDay)), where("createdAt", "<=", Timestamp.fromDate(endOfDay)), orderBy("createdAt", "desc"));
  } else {
    q = query(getSalesCollectionRef(tenantId), orderBy("createdAt", "desc"));
  }
  return onSnapshot(q, (snapshot) => {
    const sales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(sales);
  });
};
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
  const q = query(getSalesCollectionRef(tenantId), where("createdAt", ">=", startTimestamp));
  return onSnapshot(q, (snapshot) => {
    const todaySales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(todaySales);
  });
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