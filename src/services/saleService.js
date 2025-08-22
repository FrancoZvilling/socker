// src/services/saleService.js
import { db } from '../config/firebase';
import {
  collection,
  doc,
  writeBatch,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  where,
  increment // <-- Se añade 'increment' para la operación atómica
} from 'firebase/firestore';

// Referencias a nuestras colecciones (sin cambios)
const productsCollectionRef = collection(db, 'products');
const movementsCollectionRef = collection(db, 'movements');
const salesCollectionRef = collection(db, 'sales');

// --- FUNCIÓN processSale MODIFICADA Y SEGURA ---
// Se añade el nuevo parámetro 'isCreditSale' para diferenciar el tipo de venta
export const processSale = async (saleData, isCreditSale) => {
  // 1. Iniciamos un lote de escritura. Todas las operaciones dentro del lote son atómicas.
  const batch = writeBatch(db);

  // 2. Preparamos el registro de la venta.
  const saleRecord = {
    items: saleData.items,
    total: saleData.total,
    client: saleData.client,
    createdAt: serverTimestamp(),
    paymentStatus: isCreditSale ? 'pending' : 'paid', // Guardamos si la venta fue a crédito o pagada
  };
  // Creamos una referencia para el nuevo documento de venta y lo añadimos al lote.
  const newSaleRef = doc(salesCollectionRef);
  batch.set(newSaleRef, saleRecord);


  // 3. Si la venta es a crédito y hay un cliente asociado, actualizamos su saldo de forma segura.
  if (isCreditSale && saleData.client) {
    const clientRef = doc(db, 'clients', saleData.client.id);
    // 'increment(saleData.total)' es una operación atómica que se ejecuta en el servidor de Firebase.
    // Suma el total de la venta al saldo actual del cliente de forma segura.
    batch.update(clientRef, { balance: increment(saleData.total) });
  }

  // 4. Iteramos sobre los items para actualizar stock y crear movimientos (lógica similar a la anterior).
  for (const item of saleData.items) {
    const productRef = doc(productsCollectionRef, item.id);
    const newStock = item.stock - item.quantity;

    // Añadimos la actualización del stock al lote.
    batch.update(productRef, { stock: newStock });

    // Preparamos el registro de movimiento.
    const movementData = {
      productId: item.id,
      productName: item.name,
      type: 'Venta',
      quantityChange: -item.quantity,
      previousStock: item.stock,
      newStock: newStock,
      timestamp: serverTimestamp(),
      clientId: saleData.client ? saleData.client.id : null,
      clientName: saleData.client ? saleData.client.name : 'Consumidor Final',
    };
    
    // Añadimos la creación del movimiento al lote.
    const newMovementRef = doc(movementsCollectionRef);
    batch.set(newMovementRef, movementData);
  }

  // 5. Ejecutamos todas las operaciones del lote.
  // Si alguna falla, ninguna se aplicará.
  await batch.commit();
};


// --- El resto de las funciones de lectura no cambian ---

export const getSalesRealtime = (callback, date = null) => {
  let q;

  if (date) {
    // --- ESTA ES LA PARTE CORREGIDA ---
    // En lugar de new Date(date), construimos la fecha a partir de sus partes
    // para forzar la interpretación en la zona horaria local.
    const [year, month, day] = date.split('-').map(Number);
    // El mes en el constructor de Date es 0-indexado (0=Enero, 11=Diciembre)
    const startOfDay = new Date(year, month - 1, day);
    startOfDay.setHours(0, 0, 0, 0);
    const startTimestamp = Timestamp.fromDate(startOfDay);

    const endOfDay = new Date(year, month - 1, day);
    endOfDay.setHours(23, 59, 59, 999);
    const endTimestamp = Timestamp.fromDate(endOfDay);
    // ------------------------------------

    q = query(
      salesCollectionRef,
      where("createdAt", ">=", startTimestamp),
      where("createdAt", "<=", endTimestamp),
      orderBy("createdAt", "desc")
    );
  } else {
    q = query(salesCollectionRef, orderBy("createdAt", "desc"));
  }

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const sales = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(sales);
  });

  return unsubscribe;
};

export const getClientSalesRealtime = (clientId, callback) => {
  const q = query(
    salesCollectionRef,
    where("client.id", "==", clientId),
    orderBy("createdAt", "desc")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const clientSales = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(clientSales);
  });

  return unsubscribe;
};

export const getTodaySalesRealtime = (callback) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startTimestamp = Timestamp.fromDate(startOfToday);
  const q = query(salesCollectionRef, where("createdAt", ">=", startTimestamp));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const todaySales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(todaySales);
  });
  return unsubscribe;
};

export const getWeekSalesRealtime = (callback) => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const startOfWeek = new Date(today.setDate(diff));
  startOfWeek.setHours(0, 0, 0, 0);
  const startTimestamp = Timestamp.fromDate(startOfWeek);
  const q = query(salesCollectionRef, where("createdAt", ">=", startTimestamp));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const weekSales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(weekSales);
});
  return unsubscribe;
};

export const getMonthSalesRealtime = (callback) => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);
  const startTimestamp = Timestamp.fromDate(startOfMonth);
  const q = query(salesCollectionRef, where("createdAt", ">=", startTimestamp));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const monthSales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(monthSales);
  });
  return unsubscribe;
};
