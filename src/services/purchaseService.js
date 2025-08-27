// src/services/purchaseService.js
import { db } from '../config/firebase';
import {
  collection,
  doc,
  writeBatch,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';

// --- CAMBIO: Funciones de ayuda para apuntar a las subcolecciones del tenant ---
const getProductsCollectionRef = (tenantId) => collection(db, 'tenants', tenantId, 'products');
const getMovementsCollectionRef = (tenantId) => collection(db, 'tenants', tenantId, 'movements');
const getPurchasesCollectionRef = (tenantId) => collection(db, 'tenants', tenantId, 'purchases');
// --------------------------------------------------------------------------

// --- CAMBIO: La función ahora recibe 'tenantId' como primer argumento ---
export const registerPurchase = async (tenantId, purchaseData) => {
  const batch = writeBatch(db);

  // 1. Prepara el registro de la compra (la lógica interna no cambia)
  const purchaseRecord = {
    supplierId: purchaseData.supplierId,
    supplierName: purchaseData.supplierName,
    items: purchaseData.items,
    totalCost: purchaseData.totalCost,
    createdAt: serverTimestamp(),
  };
  
  // --- CAMBIO: Usamos la nueva función de ayuda para apuntar a la subcolección correcta ---
  const newPurchaseRef = doc(getPurchasesCollectionRef(tenantId));
  batch.set(newPurchaseRef, purchaseRecord);
  // --------------------------------------------------------------------------------------

  // 2. Itera sobre cada producto de la compra para actualizar stock y crear movimientos.
  for (const item of purchaseData.items) {
    // --- CAMBIO: Usamos la nueva función de ayuda para apuntar a la subcolección correcta ---
    const productRef = doc(getProductsCollectionRef(tenantId), item.productId);
    
    const newStock = item.currentStock + item.quantity;

    batch.update(productRef, { 
      stock: newStock,
      costPrice: item.costPrice 
    });

    const movementData = {
      productId: item.productId,
      productName: item.productName,
      type: 'Compra',
      quantityChange: +item.quantity,
      previousStock: item.currentStock,
      newStock: newStock,
      timestamp: serverTimestamp(),
    };
    
    // --- CAMBIO: Usamos la nueva función de ayuda para apuntar a la subcolección correcta ---
    const newMovementRef = doc(getMovementsCollectionRef(tenantId));
    batch.set(newMovementRef, movementData);
  }

  // 3. Ejecuta todas las operaciones del lote.
  await batch.commit();
};