// src/services/comboService.js
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

const getCombosCollectionRef = (tenantId) => collection(db, 'tenants', tenantId, 'combos');

// CREATE: Añadir un nuevo combo
export const addCombo = (tenantId, comboData) => {
  return addDoc(getCombosCollectionRef(tenantId), { ...comboData, createdAt: new Date() });
};

// READ: Obtener todos los combos en tiempo real
export const getCombosRealtime = (tenantId, callback) => {
  const q = query(getCombosCollectionRef(tenantId), orderBy('name'));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const combos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(combos);
  });
  return unsubscribe;
};

// UPDATE: Actualizar un combo existente
export const updateCombo = (tenantId, id, comboData) => {
  const comboDoc = doc(db, 'tenants', tenantId, 'combos', id);
  return updateDoc(comboDoc, comboData);
};

// DELETE: Eliminar un combo
export const deleteCombo = (tenantId, id) => {
  const comboDoc = doc(db, 'tenants', tenantId, 'combos', id);
  return deleteDoc(comboDoc);
};