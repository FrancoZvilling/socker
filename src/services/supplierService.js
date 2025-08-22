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

const suppliersCollectionRef = collection(db, 'suppliers');

// CREATE: Añadir un nuevo proveedor
export const addSupplier = (supplierData) => {
  return addDoc(suppliersCollectionRef, supplierData);
};

// READ: Obtener todos los proveedores en tiempo real
export const getSuppliersRealtime = (callback) => {
  const q = query(suppliersCollectionRef, orderBy('name')); // Ordenados por nombre
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const suppliers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(suppliers);
  });
  return unsubscribe;
};

// UPDATE: Actualizar un proveedor existente
export const updateSupplier = (id, supplierData) => {
  const supplierDoc = doc(db, 'suppliers', id);
  return updateDoc(supplierDoc, supplierData);
};

// DELETE: Eliminar un proveedor
export const deleteSupplier = (id) => {
  const supplierDoc = doc(db, 'suppliers', id);
  return deleteDoc(supplierDoc);
};