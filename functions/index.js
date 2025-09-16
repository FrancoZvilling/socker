// functions/index.js
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();

const region = 'southamerica-east1';

console.log("El archivo index.js de Cloud Functions se está cargando (Sintaxis v2).");

/**
 * Cloud Function (v2 onCall) para crear un empleado. (Sin cambios)
 */
exports.createEmployee = onCall({ region: region }, async (request) => {
  if (!request.auth) { throw new HttpsError("unauthenticated", "La función debe ser llamada por un usuario autenticado."); }
  const callerUserRef = db.collection("users").doc(request.auth.uid);
  const callerUserSnap = await callerUserRef.get();
  if (!callerUserSnap.exists() || callerUserSnap.data().role !== "admin") { throw new HttpsError("permission-denied", "Solo un administrador puede crear nuevos usuarios."); }
  const { email, password, role, tenantId } = request.data;
  if (!email || !password || !role || !tenantId) { throw new HttpsError("invalid-argument", "Por favor, provea todos los datos necesarios."); }
  try {
    const userRecord = await auth.createUser({ email, password });
    const newUserRef = db.collection("users").doc(userRecord.uid);
    await newUserRef.set({ email, tenantId, role });
    return { status: "success", message: `Usuario ${email} creado con éxito.`, uid: userRecord.uid };
  } catch (error) {
    console.error("Error al crear el usuario:", error);
    throw new HttpsError("already-exists", error.message);
  }
});

/**
 * Cloud Function (v2 onCall) para solicitar una cuenta. (Sin cambios)
 */
exports.requestNewTenant = onCall({ region: region }, async (request) => {
  const { businessName, email, whatsapp } = request.data;
  if (!businessName || !email || !whatsapp) { throw new HttpsError("invalid-argument", "Faltan datos en la solicitud."); }
  try {
    const tenantRef = await db.collection("tenants").add({
      name: businessName,
      contactEmail: email,
      contactWhatsapp: whatsapp,
      status: "pending_approval",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`--- NUEVA SOLICITUD DE CUENTA RECIBIDA ---`);
    console.log(`Negocio: ${businessName} (ID: ${tenantRef.id})`);
    return { status: "success", message: "Solicitud recibida con éxito." };
  } catch (error) {
    console.error("Error al guardar la solicitud de tenant:", error);
    throw new HttpsError("internal", "No se pudo procesar la solicitud.");
  }
});

/**
 * Cloud Function (v2 onDocumentUpdated) que se dispara al aprobar un tenant.
 * --- MODIFICADA para activar la cuenta inmediatamente ---
 */
exports.onTenantApprove = onDocumentUpdated({
  document: "tenants/{tenantId}",
  region: region
}, async (event) => {
  const beforeData = event.data.before.data();
  const afterData = event.data.after.data();

  if (beforeData.status === 'pending_approval' && afterData.status === 'approved') {
    const tenantId = event.params.tenantId;
    const tenantData = afterData;
    try {
      const userRecord = await auth.createUser({
        email: tenantData.contactEmail,
        displayName: tenantData.name,
      });

      const batch = db.batch();

      const userRef = db.collection("users").doc(userRecord.uid);
      batch.set(userRef, {
        email: userRecord.email,
        tenantId: tenantId,
        role: "admin",
      });

      const tenantRef = event.data.after.ref;
      // Se actualiza el ownerUid Y el status a 'active' en la misma operación.
      batch.update(tenantRef, { 
        ownerUid: userRecord.uid,
        status: 'active' // La cuenta se activa inmediatamente
      });

      await batch.commit();

      const appUrl = 'https://socker-kohl.vercel.app/finalizar-registro';
      const actionLink = await auth.generatePasswordResetLink(tenantData.contactEmail, { url: appUrl });

      console.log(`--- CUENTA ACTIVADA Y ENLACE ENVIADO ---`);
      console.log(`Para: ${tenantData.contactEmail}`);
      console.log(`Enlace: ${actionLink}`);
      console.log(`----------------------------------`);
      
    } catch (error) {
      console.error("Error en onTenantApprove (v2):", error);
      await event.data.after.ref.update({ status: 'approval_failed' });
    }
  }
  return null;
});








