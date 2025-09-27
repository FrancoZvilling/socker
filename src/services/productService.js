// src/services/productService.js
import { db } from '../config/firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  doc,
  deleteDoc,
  updateDoc,
  where,
  orderBy
} from 'firebase/firestore';

const getProductsCollectionRef = (tenantId) => collection(db, 'tenants', tenantId, 'products');
const getMovementsCollectionRef = (tenantId) => collection(db, 'tenants', tenantId, 'movements');

export const addProduct = (tenantId, productData) => {
  return addDoc(getProductsCollectionRef(tenantId), productData);
};

export const getProductsRealtime = (tenantId, callback) => {
  const q = query(getProductsCollectionRef(tenantId));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const products = [];
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    callback(products);
  });
  return unsubscribe;
};

export const deleteProduct = (tenantId, id) => {
  const productDoc = doc(db, 'tenants', tenantId, 'products', id);
  return deleteDoc(productDoc);
};

export const updateProduct = (tenantId, id, productData) => {
  const productDoc = doc(db, 'tenants', tenantId, 'products', id);
  return updateDoc(productDoc, productData);
};

export const createMovement = (tenantId, movementData) => {
  return addDoc(getMovementsCollectionRef(tenantId), movementData);
};

export const getProductMovements = (tenantId, productId, callback) => {
  const q = query(
    getMovementsCollectionRef(tenantId),
    where("productId", "==", productId),
    orderBy("timestamp", "desc")
  );
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const movements = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(movements);
  });
  return unsubscribe;
};

export const getLowStockProductsRealtime = (tenantId, callback) => {
  const q = query(getProductsCollectionRef(tenantId));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const lowStockProducts = allProducts.filter(p => p.stock > 0 && p.stock <= (p.minStock || 0));
    callback(lowStockProducts);
  });
  return unsubscribe;
};

// --- NUEVA FUNCIÓN PARA EL DASHBOARD ---
export const getOutOfStockProductsRealtime = (tenantId, callback) => {
  // Creamos una consulta que busca productos donde el campo 'stock' sea igual a 0.
  const q = query(
    getProductsCollectionRef(tenantId),
    where("stock", "==", 0)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    // No necesitamos los datos completos, solo la cantidad.
    // Devolver el tamaño del snapshot es muy eficiente.
    callback(snapshot.size);
  });
  return unsubscribe;
};