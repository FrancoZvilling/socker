// src/services/saleService.js
import { db } from '../config/firebase';
import {
  collection,
  doc,
  writeBatch, // Se mantiene por si se usa en otro lado, pero processSale usará transacciones
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  where,
  increment,
  getDocs,
  // Se añaden 'runTransaction' y 'getDoc' para la nueva lógica
  runTransaction,
  getDoc
} from 'firebase/firestore';

const getSalesCollectionRef = (tenantId) => collection(db, 'tenants', tenantId, 'sales');
const getMovementsCollectionRef = (tenantId) => collection(db, 'tenants', tenantId, 'movements');
const getProductsCollectionRef = (tenantId) => collection(db, 'tenants', tenantId, 'products');
const getClientsCollectionRef = (tenantId) => collection(db, 'tenants', tenantId, 'clients');

// --- FUNCIÓN processSale REEMPLAZADA POR LA VERSIÓN CON TRANSACCIONES ---
export const processSale = async (tenantId, saleData, isCreditSale, paymentMethod) => {
  const newSaleRef = doc(getSalesCollectionRef(tenantId));

  await runTransaction(db, async (transaction) => {
    // --- FASE 1: LEER TODOS LOS DOCUMENTOS NECESARIOS ---
    
    // Obtenemos las referencias de todos los productos y componentes involucrados
    const allProductIds = new Set();
    saleData.items.forEach(item => {
      if (item.type === 'product') {
        allProductIds.add(item.id);
      } else if (item.type === 'combo') {
        item.components.forEach(c => allProductIds.add(c.productId));
      }
    });

    const productRefs = Array.from(allProductIds).map(id => doc(getProductsCollectionRef(tenantId), id));
    const productDocs = await Promise.all(productRefs.map(ref => transaction.get(ref)));
    
    let clientDoc;
    if (isCreditSale && saleData.client) {
      const clientRef = doc(getClientsCollectionRef(tenantId), saleData.client.id);
      clientDoc = await transaction.get(clientRef);
      if (!clientDoc.exists()) throw new Error("Cliente no encontrado.");
    }
    
    // --- FASE 2: PROCESAR Y ESCRIBIR ---

    const productsDataMap = new Map(productDocs.map(doc => [doc.id, doc.data()]));
    
    // Lógica de cálculo de costos
    const itemsWithCost = saleData.items.map(item => {
        let calculatedCostPrice = 0;
        if (item.type === 'product') {
            calculatedCostPrice = (productsDataMap.get(item.id)?.costPrice || 0);
        } else if (item.type === 'combo') {
            calculatedCostPrice = item.components.reduce((sum, component) => {
                const componentCost = productsDataMap.get(component.productId)?.costPrice || 0;
                return sum + (componentCost * component.quantity);
            }, 0);
        }
        return { ...item, costPrice: calculatedCostPrice };
    });

    // Escritura del registro de venta
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
    transaction.set(newSaleRef, saleRecord);
    
    // Escritura de saldo de cliente
    if (isCreditSale && clientDoc) {
        const currentBalance = clientDoc.data().balance || 0;
        transaction.update(clientDoc.ref, { balance: currentBalance + saleData.total });
    }
    
    // Escritura de stock y movimientos
    for (const item of saleData.items) {
      const processProduct = (productId, name, quantity, comboName = null) => {
        const productData = productsDataMap.get(productId);
        if (!productData) throw new Error(`Producto "${name}" no encontrado.`);
        
        const previousStock = productData.stock;
        const newStock = previousStock - quantity;
        if (newStock < 0) throw new Error(`Stock insuficiente para "${name}".`);
        
        const productRef = doc(getProductsCollectionRef(tenantId), productId);
        transaction.update(productRef, { stock: newStock });

        const movementData = {
          productId, productName: name, type: comboName ? `Venta (Combo: ${comboName})` : 'Venta',
          quantityChange: -quantity, previousStock, newStock,
          timestamp: serverTimestamp(), saleId: newSaleRef.id,
        };
        const newMovementRef = doc(getMovementsCollectionRef(tenantId));
        transaction.set(newMovementRef, movementData);
      };

      if (item.type === 'product') {
        processProduct(item.id, item.name, item.quantity);
      } else if (item.type === 'combo') {
        for (const component of item.components) {
          const quantityToDecrement = component.quantity * item.quantity;
          processProduct(component.productId, component.productName, quantityToDecrement, item.name);
        }
      }
    }
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
  const q = query(
    getSalesCollectionRef(tenantId),
    where("createdAt", ">=", startTimestamp),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const todaySales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(todaySales);
  });
};

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