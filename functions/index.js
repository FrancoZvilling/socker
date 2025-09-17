// functions/index.js
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const sgMail = require('@sendgrid/mail');

admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();

const region = 'southamerica-east1';

console.log("El archivo index.js de Cloud Functions se está cargando (Sintaxis v2).");

/**
 * Cloud Function (v2 onCall) para que un admin cree un nuevo usuario empleado.
 */
exports.createEmployee = onCall({ region: region }, async (request) => {
  if (!request.auth) { throw new HttpsError("unauthenticated", "La función debe ser llamada por un usuario autenticado."); }
  const callerUserRef = db.collection("users").doc(request.auth.uid);
  const callerUserSnap = await callerUserRef.get();
  if (!callerUserSnap.exists || callerUserSnap.data().role !== "admin") { throw new HttpsError("permission-denied", "Solo un administrador puede crear nuevos usuarios."); }
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
 * Cloud Function (v2 onCall) para que un visitante solicite una nueva cuenta de negocio.
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
 */
exports.onTenantApprove = onDocumentUpdated({
  document: "tenants/{tenantId}",
  region: region,
  secrets: ["SENDGRID_API_KEY"]
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
      batch.update(tenantRef, { 
        ownerUid: userRecord.uid,
        status: 'active'
      });
      await batch.commit();
      const appUrl = 'https://socker-kohl.vercel.app/finalizar-registro';
      const actionLink = await auth.generatePasswordResetLink(tenantData.contactEmail, { url: appUrl });
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      const msg = {
        to: tenantData.contactEmail,
        from: 'francozvilling-programador@hotmail.com',
        subject: `¡Tu cuenta en ${tenantData.name} ha sido aprobada!`,
        html: `<p>Haz clic en el enlace para activar: <a href="${actionLink}">Activar</a></p>`,
      };
      await sgMail.send(msg);
      console.log(`Email de activación enviado exitosamente a ${tenantData.contactEmail}`);
    } catch (error) {
      console.error("Error en onTenantApprove (v2):", error);
      await event.data.after.ref.update({ status: 'approval_failed' });
    }
  }
  return null;
});


/**
 * Cloud Function (v2 onCall) para análisis de ventas.
 * --- CORREGIDA ---
 */
exports.getSalesAnalytics = onCall({ region: region }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "La función debe ser llamada por un usuario autenticado.");
  }
  
  const tenantId = request.data.tenantId;
  if (!tenantId) {
    throw new HttpsError("invalid-argument", "Se requiere el ID del tenant.");
  }
  
  const callerUserRef = db.collection("users").doc(request.auth.uid);
  const callerUserSnap = await callerUserRef.get();
  
  // Se corrige la comprobación de '.exists' (propiedad, no función)
  if (!callerUserSnap.exists || callerUserSnap.data().tenantId !== tenantId) {
    throw new HttpsError("permission-denied", "No tienes permiso para acceder a estos datos.");
  }

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    // Se usa la referencia a Timestamp a través de admin.firestore
    const startTimestamp = admin.firestore.Timestamp.fromDate(thirtyDaysAgo);

    const salesRef = db.collection(`tenants/${tenantId}/sales`);
    const salesQuery = salesRef.where("createdAt", ">=", startTimestamp);
    
    const salesSnapshot = await salesQuery.get();

    if (salesSnapshot.empty) {
      return { topProducts: [] };
    }
    
    const productCounts = {};
    salesSnapshot.forEach(doc => {
      const sale = doc.data();
      (sale.items || []).forEach(item => {
        if (item.type === 'product') {
          productCounts[item.name] = (productCounts[item.name] || 0) + item.quantity;
        } else if (item.type === 'combo') {
          (item.components || []).forEach(component => {
            const quantitySold = component.quantity * item.quantity;
            productCounts[component.productName] = (productCounts[component.productName] || 0) + quantitySold;
          });
        }
      });
    });

    const sortedProducts = Object.entries(productCounts)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return { topProducts: sortedProducts };

  } catch (error) {
    console.error("--- ERROR CRÍTICO en getSalesAnalytics ---:", error);
    throw new HttpsError("internal", "No se pudo generar el análisis de ventas.");
  }
});

exports.getMonthlySalesAnalytics = onCall({ region: region }, async (request) => {
  // ... (la misma verificación de seguridad que en getSalesAnalytics)
  if (!request.auth || !request.data.tenantId) { /*...*/ }
  const tenantId = request.data.tenantId;
  // ... (verificar que el usuario pertenece al tenant)

  try {
    // Obtenemos las ventas de los últimos 12 meses
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    const startTimestamp = admin.firestore.Timestamp.fromDate(twelveMonthsAgo);

    const salesRef = db.collection(`tenants/${tenantId}/sales`);
    const salesQuery = salesRef.where("createdAt", ">=", startTimestamp).orderBy("createdAt", "asc");
    const salesSnapshot = await salesQuery.get();
    
    // Objeto para agrupar ventas por mes (ej: "2025-09")
    const monthlySales = {};

    salesSnapshot.forEach(doc => {
      const sale = doc.data();
      const saleDate = sale.createdAt.toDate();
      // Creamos una clave 'YYYY-MM' para agrupar
      const monthKey = `${saleDate.getFullYear()}-${(saleDate.getMonth() + 1).toString().padStart(2, '0')}`;
      
      monthlySales[monthKey] = (monthlySales[monthKey] || 0) + sale.total;
    });

    // Convertimos el objeto en un array de { month, total }
    const formattedSales = Object.entries(monthlySales).map(([month, total]) => ({
      month,
      total,
    }));

    return { monthlySales: formattedSales };

  } catch (error) {
    console.error("Error en getMonthlySalesAnalytics:", error);
    throw new HttpsError("internal", "No se pudo generar el análisis mensual.");
  }
});








