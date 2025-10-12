// src/services/returnService.js
import { db } from '../config/firebase';
// Se añaden 'runTransaction' y 'getDoc'
import { collection, doc, serverTimestamp, getDoc, runTransaction } from 'firebase/firestore';

const getReturnsCollectionRef = (tenantId) => collection(db, 'tenants', tenantId, 'returns');
const getProductsCollectionRef = (tenantId) => collection(db, 'tenants', tenantId, 'products');
const getMovementsCollectionRef = (tenantId) => collection(db, 'tenants', tenantId, 'movements');
const getClientsCollectionRef = (tenantId) => collection(db, 'tenants', tenantId, 'clients');
const getSalesCollectionRef = (tenantId) => collection(db, 'tenants', tenantId, 'sales');

export const processReturn = async (tenantId, returnData) => {
  // Usamos una transacción para leer y luego escribir de forma segura
  await runTransaction(db, async (transaction) => {
    // --- FASE 1: LEER DATOS ---
    
    // Obtenemos las referencias de todos los productos y componentes involucrados
    const allProductIds = new Set();
    returnData.returnedItems.forEach(item => {
      if (item.type === 'product') {
        allProductIds.add(item.id);
      } else if (item.type === 'combo') {
        item.components.forEach(c => allProductIds.add(c.productId));
      }
    });

    const productRefs = Array.from(allProductIds).map(id => doc(getProductsCollectionRef(tenantId), id));
    const productDocs = await Promise.all(productRefs.map(ref => transaction.get(ref)));
    const productsDataMap = new Map(productDocs.map(p => [p.id, p.data()]));
    
    let clientDoc;
    if (returnData.client) {
      const clientRef = doc(getClientsCollectionRef(tenantId), returnData.client.id);
      clientDoc = await transaction.get(clientRef);
      if (!clientDoc.exists()) throw new Error("Cliente no encontrado.");
    }
    
    // --- FASE 2: PROCESAR Y ESCRIBIR ---

    // 1. Crea el registro de la devolución
    const returnRecord = {
      originalSaleId: returnData.originalSaleId,
      returnedItems: returnData.returnedItems,
      totalReturnedValue: returnData.totalReturnedValue,
      client: returnData.client,
      processedBy: returnData.processedBy,
      createdAt: serverTimestamp(),
    };
    const newReturnRef = doc(getReturnsCollectionRef(tenantId));
    transaction.set(newReturnRef, returnRecord);

    // 2. Itera para actualizar stock y crear movimientos
    for (const item of returnData.returnedItems) {
      const processProductReturn = (productId, name, quantity, comboName = null) => {
        const productData = productsDataMap.get(productId);
        if (!productData) throw new Error(`Producto a devolver no encontrado: ${name}`);

        const previousStock = productData.stock;
        const newStock = previousStock + quantity;

        const productRef = doc(getProductsCollectionRef(tenantId), productId);
        transaction.update(productRef, { stock: newStock });

        const movementData = {
          productId,
          productName: name,
          type: comboName ? `Devolución (Combo: ${comboName})` : 'Devolución',
          quantityChange: +quantity,
          previousStock,
          newStock,
          timestamp: serverTimestamp(),
        };
        const newMovementRef = doc(getMovementsCollectionRef(tenantId));
        transaction.set(newMovementRef, movementData);
      };

      if (item.type === 'product') {
        processProductReturn(item.id, item.name, item.returnQuantity);
      } else if (item.type === 'combo') {
        for (const component of item.components) {
          const quantityToIncrement = component.quantity * item.returnQuantity;
          processProductReturn(component.productId, component.productName, quantityToIncrement, item.name);
        }
      }
    }

    // 3. Ajusta el saldo del cliente
    if (returnData.client && clientDoc) {
      const currentBalance = clientDoc.data().balance || 0;
      transaction.update(clientDoc.ref, { balance: currentBalance - returnData.totalReturnedValue });
    }

    // 4. Marca la venta original como devuelta
    const originalSaleRef = doc(getSalesCollectionRef(tenantId), returnData.originalSaleId);
    transaction.update(originalSaleRef, { returnStatus: 'completed' });
  });
};