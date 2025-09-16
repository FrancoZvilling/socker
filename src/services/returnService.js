// src/services/returnService.js
import { db } from '../config/firebase';
import { collection, doc, writeBatch, serverTimestamp, increment } from 'firebase/firestore';

const getReturnsCollectionRef = (tenantId) => collection(db, 'tenants', tenantId, 'returns');
const getProductsCollectionRef = (tenantId) => collection(db, 'tenants', tenantId, 'products');
const getMovementsCollectionRef = (tenantId) => collection(db, 'tenants', tenantId, 'movements');
const getClientsCollectionRef = (tenantId) => collection(db, 'tenants', tenantId, 'clients');
const getSalesCollectionRef = (tenantId) => collection(db, 'tenants', tenantId, 'sales'); // <-- Referencia a Ventas

export const processReturn = async (tenantId, returnData) => {
  const batch = writeBatch(db);

  // 1. Crea el registro de la devolución (sin cambios)
  const returnRecord = {
    originalSaleId: returnData.originalSaleId,
    returnedItems: returnData.returnedItems,
    totalReturnedValue: returnData.totalReturnedValue,
    client: returnData.client,
    processedBy: returnData.processedBy,
    createdAt: serverTimestamp(),
  };
  const newReturnRef = doc(getReturnsCollectionRef(tenantId));
  batch.set(newReturnRef, returnRecord);

  // 2. Itera sobre cada producto devuelto (sin cambios)
  for (const item of returnData.returnedItems) {
    const productRef = doc(getProductsCollectionRef(tenantId), item.id);
    batch.update(productRef, { stock: increment(item.returnQuantity) });

    const movementData = {
      productId: item.id,
      productName: item.name,
      type: 'Devolución',
      quantityChange: +item.returnQuantity,
      timestamp: serverTimestamp(),
    };
    const newMovementRef = doc(getMovementsCollectionRef(tenantId));
    batch.set(newMovementRef, movementData);
  }

  // 3. Si hay cliente, ajustamos su saldo (sin cambios)
  if (returnData.client) {
    const clientRef = doc(getClientsCollectionRef(tenantId), returnData.client.id);
    batch.update(clientRef, { balance: increment(-returnData.totalReturnedValue) });
  }

  // --- 4. NUEVO Y CRÍTICO: MARCAR LA VENTA ORIGINAL ---
  // Obtenemos la referencia al documento de la venta original
  const originalSaleRef = doc(getSalesCollectionRef(tenantId), returnData.originalSaleId);
  // Añadimos una operación al lote para actualizar el estado de la venta
  batch.update(originalSaleRef, { returnStatus: 'completed' });
  // --------------------------------------------------

  // 5. Ejecuta todas las operaciones del lote.
  await batch.commit();
};