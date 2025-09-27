// src/services/importService.js
import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';

export const importProductsBulk = (tenantId, productsToImport) => {
  const importFunction = httpsCallable(functions, 'importProductsBulk');
  return importFunction({ tenantId, productsToImport });
};