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

/**
 * Cloud Function (v2 onCall) para actualizar precios de productos en masa.
 * Recibe un objeto con las instrucciones y aplica los cambios de forma segura.
 */
exports.updatePricesBulk = onCall({ region: region, timeoutSeconds: 300 }, async (request) => {
  // 1. Verificación de seguridad: solo un admin puede ejecutar esta acción.
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "La función debe ser llamada por un usuario autenticado.");
  }
  const { tenantId } = request.data;
  const callerUserRef = db.collection("users").doc(request.auth.uid);
  const callerUserSnap = await callerUserRef.get();
  if (!callerUserSnap.exists || callerUserSnap.data().role !== "admin" || callerUserSnap.data().tenantId !== tenantId) {
    throw new HttpsError("permission-denied", "Solo un administrador de este negocio puede modificar precios.");
  }

  // 2. Extraemos y validamos los parámetros de la solicitud.
  const { percentage, operation, targetPrices, category, supplierId } = request.data;
  if (!percentage || !operation || !targetPrices) {
    throw new HttpsError("invalid-argument", "Faltan parámetros (porcentaje, operación o precios objetivo).");
  }

  // 3. Construimos la consulta a Firestore de forma dinámica.
  let productsQuery = db.collection(`tenants/${tenantId}/products`);
  
  if (category) {
    productsQuery = productsQuery.where('category', '==', category);
  }
  if (supplierId) {
    productsQuery = productsQuery.where('supplierId', '==', supplierId);
  }

  try {
    // 4. Obtenemos todos los productos que coinciden con los filtros.
    const snapshot = await productsQuery.get();
    if (snapshot.empty) {
      console.log("No se encontraron productos que coincidan con los filtros.");
      return { status: "success", message: "No se encontraron productos para actualizar." };
    }

    // 5. Preparamos una escritura por lotes.
    const batch = db.batch();
    const multiplier = operation === 'increase'
      ? 1 + (percentage / 100)
      : 1 - (percentage / 100);

    snapshot.forEach(doc => {
      const product = doc.data();
      const updates = {};

      // 6. Calculamos los nuevos precios según el objetivo.
      if (targetPrices === 'sale' || targetPrices === 'both') {
        const newPrice = (product.price || 0) * multiplier;
        updates.price = parseFloat(newPrice.toFixed(2)); // Redondeamos a 2 decimales
      }
      if (targetPrices === 'cost' || targetPrices === 'both') {
        const newCostPrice = (product.costPrice || 0) * multiplier;
        updates.costPrice = parseFloat(newCostPrice.toFixed(2));
      }
      
      // Añadimos la operación de actualización al lote.
      if (Object.keys(updates).length > 0) {
        batch.update(doc.ref, updates);
      }
    });

    // 7. Ejecutamos todas las actualizaciones de una sola vez.
    await batch.commit();

    return {
      status: "success",
      message: `Se actualizaron los precios de ${snapshot.size} productos.`,
    };
  } catch (error) {
    console.error("Error al actualizar precios en masa:", error);
    // Este error probablemente indicará que falta un índice compuesto.
    throw new HttpsError("internal", error.message);
  }
});

exports.importProductsBulk = onCall({ region: region, timeoutSeconds: 300 }, async (request) => {
  // 1. Seguridad
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "La función debe ser llamada por un usuario autenticado.");
  }
  const { tenantId, productsToImport } = request.data;
  const callerUserRef = db.collection("users").doc(request.auth.uid);
  const callerUserSnap = await callerUserRef.get();
  if (!callerUserSnap.exists || callerUserSnap.data().role !== "admin" || callerUserSnap.data().tenantId !== tenantId) {
    throw new HttpsError("permission-denied", "Solo un administrador puede importar productos.");
  }
  
  if (!Array.isArray(productsToImport) || productsToImport.length === 0) {
    throw new HttpsError("invalid-argument", "No se proporcionaron productos para importar.");
  }

  // Obtenemos la referencia a la subcolección correcta
  const productsCollectionRef = db.collection(`tenants/${tenantId}/products`);
  
  const batchSize = 400;
  const batches = [];

  for (let i = 0; i < productsToImport.length; i += batchSize) {
    const batch = db.batch();
    const chunk = productsToImport.slice(i, i + batchSize);
    
    chunk.forEach(product => {
      // Usamos 'doc()' sin argumentos para que Firestore genere un ID automático
      const newProductRef = productsCollectionRef.doc();
      
      const productData = {
        name: product.name || 'Sin Nombre',
        sku: product.sku || '',
        category: product.category || '',
        stock: Number(product.stock) || 0,
        costPrice: Number(product.costPrice) || 0,
        price: Number(product.price) || 0,
        minStock: Number(product.minStock) || 0,
        supplierId: null,
        supplierName: '',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      batch.set(newProductRef, productData);
    });
    batches.push(batch.commit());
  }

  try {
    await Promise.all(batches);
    return {
      status: "success",
      message: `Se importaron ${productsToImport.length} productos con éxito.`,
    };
  } catch (error) {
    console.error("Error al importar productos en masa:", error);
    throw new HttpsError("internal", "Ocurrió un error durante la importación masiva.");
  }
});







