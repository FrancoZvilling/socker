// src/services/superAdminService.js
import { db } from '../config/firebase';
// Se añaden 'doc' y 'updateDoc' para poder modificar el estado del tenant.
import { collection, query, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';

// La función para obtener la lista de tenants no necesita cambios.
export const getTenantsRealtime = (callback) => {
  const tenantsCollectionRef = collection(db, 'tenants');
  const q = query(tenantsCollectionRef, orderBy('createdAt', 'desc'));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const tenants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(tenants);
  });
  return unsubscribe;
};

// --- FUNCIÓN 'approveTenantAccount' MODIFICADA ---
// Ahora es una simple escritura en la base de datos. Ya no llama a una Cloud Function.
export const approveTenantAccount = (tenantId) => {
  // Obtenemos la referencia al documento del tenant que queremos modificar.
  const tenantRef = doc(db, 'tenants', tenantId);
  
  // Usamos updateDoc para cambiar el campo 'status'.
  // Esto disparará la nueva Cloud Function 'onTenantApprove' en el backend.
  return updateDoc(tenantRef, {
    status: 'approved'
  });
};

export const updateTenantStatus = (tenantId, newStatus) => {
  // newStatus será 'active' o 'suspended'
  const tenantRef = doc(db, 'tenants', tenantId);
  return updateDoc(tenantRef, {
    status: newStatus
  });
};