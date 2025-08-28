// functions/index.js

const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Inicializamos la app de Admin. Esto le da a nuestras funciones
// acceso de superadministrador a todos los servicios de Firebase.
admin.initializeApp();

// Obtenemos referencias a los servicios de Admin que usaremos.
const auth = admin.auth();
const db = admin.firestore();

/**
 * Cloud Function para crear un nuevo usuario empleado.
 * Esta es una función "callable", lo que significa que podemos llamarla
 * directamente desde nuestra aplicación cliente.
 */
exports.createEmployee = functions.https.onCall(async (data, context) => {
  // 1. Verificación de seguridad: ¿Quien llama a esta función es un admin?
  // 'context.auth' contiene la información del usuario que hizo la llamada.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "La función debe ser llamada por un usuario autenticado.",
    );
  }

  // Obtenemos la información del usuario que llama a la función desde nuestra DB
  const callerUserRef = db.collection("users").doc(context.auth.uid);
  const callerUserSnap = await callerUserRef.get();

  if (!callerUserSnap.exists() || callerUserSnap.data().role !== "admin") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Solo un administrador puede crear nuevos usuarios.",
    );
  }

  // 2. Obtenemos los datos del nuevo empleado que nos envió el cliente.
  const { email, password, role, tenantId } = data;

  // Verificamos que tengamos todos los datos necesarios.
  if (!email || !password || !role || !tenantId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Por favor, provea todos los datos necesarios (email, password, role, tenantId).",
    );
  }

  try {
    // 3. Creamos el usuario en Firebase Authentication usando el SDK de Admin.
    const userRecord = await auth.createUser({
      email: email,
      password: password,
    });

    // 4. Creamos el documento del usuario en Firestore.
    const newUserRef = db.collection("users").doc(userRecord.uid);
    await newUserRef.set({
      email: email,
      tenantId: tenantId,
      role: role,
    });

    // 5. Si todo salió bien, devolvemos un mensaje de éxito.
    return {
      status: "success",
      message: `Usuario ${email} creado con éxito.`,
      uid: userRecord.uid,
    };
  } catch (error) {
    // Si el usuario ya existe en Auth, 'createUser' fallará.
    // Manejamos el error y lo devolvemos al cliente de forma clara.
    console.error("Error al crear el usuario:", error);
    throw new functions.https.HttpsError(
      "already-exists",
      error.message,
    );
  }
});
