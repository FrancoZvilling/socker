// src/services/tenantService.js
import { db } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export const updateTenantData = (tenantId, data) => {
  const tenantRef = doc(db, 'tenants', tenantId);
  return updateDoc(tenantRef, data);
};