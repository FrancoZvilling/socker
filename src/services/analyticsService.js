// src/services/analyticsService.js
import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';

export const getSalesAnalytics = (tenantId) => {
  const getAnalytics = httpsCallable(functions, 'getSalesAnalytics');
  return getAnalytics({ tenantId });
};

export const getMonthlySalesAnalytics = (tenantId) => {
  const getMonthlyAnalytics = httpsCallable(functions, 'getMonthlySalesAnalytics');
  return getMonthlyAnalytics({ tenantId });
}