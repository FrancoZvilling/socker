// src/services/storageService.js
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '../config/firebase'; // Importamos la app inicializada

const storage = getStorage(app);

/**
 * Sube el logo de un negocio y devuelve la URL pública.
 * @param {string} tenantId - El ID del negocio.
 * @param {string} userId - El ID del usuario que está subiendo el archivo.
 * @param {File} file - El archivo de imagen a subir.
 * @returns {Promise<string>} La URL de descarga de la imagen.
 */
// Se añade el parámetro 'userId' a la función.
export const uploadBusinessLogo = async (tenantId, userId, file) => {
  // La ruta del archivo ahora incluye el userId para una mayor seguridad en las reglas.
  // Ejemplo de ruta: 'tenants/ID_DEL_NEGOCIO/users/ID_DEL_USUARIO/logo_nombrearchivo.png'
  const logoRef = ref(storage, `tenants/${tenantId}/users/${userId}/logo_${file.name}`);

  // El resto de la lógica para subir el archivo y obtener la URL no cambia.
  const snapshot = await uploadBytes(logoRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);

  return downloadURL;
};