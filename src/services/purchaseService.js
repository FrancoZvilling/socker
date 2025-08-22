// src/services/purchaseService.js
import { db } from '../config/firebase';
import {
  collection,
  doc,
  writeBatch,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';

const productsCollectionRef = collection(db, 'products');
const movementsCollectionRef = collection(db, 'movements');
const purchasesCollectionRef = collection(db, 'purchases');

export const registerPurchase = async (purchaseData) => {
  const batch = writeBatch(db);

  // 1. Crea un registro de la compra en la colección 'purchases'.
  const purchaseRecord = {
    supplierId: purchaseData.supplierId,
    supplierName: purchaseData.supplierName,
    items: purchaseData.items,
    totalCost: purchaseData.totalCost,
    createdAt: serverTimestamp(),
  };
  // Lo añadimos fuera del lote para poder obtener su ID si fuera necesario.
  await addDoc(purchasesCollectionRef, purchaseRecord);

  // 2. Itera sobre cada producto de la compra para actualizar stock y crear movimientos.
  for (const item of purchaseData.items) {
    const productRef = doc(productsCollectionRef, item.productId);
    
    // Calculamos el nuevo stock sumando la cantidad recibida
    const newStock = item.currentStock + item.quantity;

    // Añadimos la operación de ACTUALIZAR PRODUCTO al lote.
    // Actualizamos tanto el stock como el último precio de costo.
    batch.update(productRef, { 
      stock: newStock,
      costPrice: item.costPrice 
    });

    // Creamos el registro de movimiento para el historial
    const movementData = {
      productId: item.productId,
      productName: item.productName,
      type: 'Compra',
      quantityChange: +item.quantity, // Positivo porque es una entrada
      previousStock: item.currentStock,
      newStock: newStock,
      timestamp: serverTimestamp(),
    };
    
    const newMovementRef = doc(movementsCollectionRef);
    batch.set(newMovementRef, movementData);
  }

  // 3. Ejecuta todas las operaciones del lote.
  await batch.commit();
};