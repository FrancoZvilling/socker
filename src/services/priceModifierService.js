// src/services/priceModifierService.js
import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';

export const updatePricesBulk = (tenantId, modificationData) => {
  const updateFunction = httpsCallable(functions, 'updatePricesBulk');
  return updateFunction({ tenantId, ...modificationData });
};