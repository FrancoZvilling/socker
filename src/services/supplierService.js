// src/services/supplierService.js
import { db } from '../config/firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  doc,
  updateDoc,
  deleteDoc,
  orderBy
} from 'firebase/firestore';

// 1. Reemplazamos la referencia de colección estática por una función dinámica.
// Esta función construye la ruta a la subcolección 'suppliers' DENTRO de un 'tenant' específico.
const getSuppliersCollectionRef = (tenantId) => collection(db, 'tenants', tenantId, 'suppliers');

// 2. CREATE: La función ahora requiere 'tenantId' como primer parámetro.
export const addSupplier = (tenantId, supplierData) => {
  // Usamos la nueva función para obtener la referencia correcta.
  return addDoc(getSuppliersCollectionRef(tenantId), { ...supplierData, createdAt: new Date() });
};

// 3. READ: La función ahora requiere 'tenantId' como primer parámetro.
export const getSuppliersRealtime = (tenantId, callback) => {
  const q = query(getSuppliersCollectionRef(tenantId), orderBy('name')); // Ordenados por nombre
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const suppliers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(suppliers);
  });
  return unsubscribe;
};

// 4. UPDATE: La función ahora requiere 'tenantId' como primer parámetro.
export const updateSupplier = (tenantId, id, supplierData) => {
  // La referencia al documento ahora debe incluir la ruta completa del 'tenant'.
  const supplierDoc = doc(db, 'tenants', tenantId, 'suppliers', id);
  return updateDoc(supplierDoc, supplierData);
};

// 5. DELETE: La función ahora requiere 'tenantId' como primer parámetro.
export const deleteSupplier = (tenantId, id) => {
  const supplierDoc = doc(db, 'tenants', tenantId, 'suppliers', id);
  return deleteDoc(supplierDoc);
};