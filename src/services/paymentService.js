// src/services/paymentService.js
import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';

export const markSaleAsPaid = (tenantId, saleId) => {
  const markAsPaidFunction = httpsCallable(functions, 'markSaleAsPaid');
  return markAsPaidFunction({ tenantId, saleId });
};