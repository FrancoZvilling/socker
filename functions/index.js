// functions/index.js
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const sgMail = require('@sendgrid/mail'); // Se añade la importación de SendGrid

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
 * --- MODIFICADA para enviar el email de activación con SendGrid ---
 */
exports.onTenantApprove = onDocumentUpdated({
  document: "tenants/{tenantId}",
  region: region,
  secrets: ["SENDGRID_API_KEY"] // Se declara que la función necesita acceso al secreto
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

      // --- Lógica de Envío de Email con SendGrid ---
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);

      const msg = {
        to: tenantData.contactEmail,
        from: 'francozvilling-programador@hotmail.com', 
        subject: `¡Tu cuenta en ${tenantData.name} ha sido aprobada!`,
        html: `
          <h1>¡Bienvenido/a a Stocker!</h1>
          <p>Tu cuenta para el negocio "<strong>${tenantData.name}</strong>" ha sido creada y activada con éxito.</p>
          <p>Para tu primer inicio de sesión, por favor, establece una contraseña segura haciendo clic en el siguiente enlace:</p>
          <p style="text-align: center;">
            <a href="${actionLink}" target="_blank" style="background-color: #3182ce; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px;">
              Crear mi Contraseña
            </a>
          </p>
          <p>Si tienes algún problema, no dudes en contactarnos.</p>
        `,
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








