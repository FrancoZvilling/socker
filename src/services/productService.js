// src/services/productService.js
import { db } from '../config/firebase';
// AQUÍ ESTÁ LA CORRECCIÓN: 'query' ha sido añadido a la lista de importación.
import { collection, addDoc, onSnapshot, query, doc, deleteDoc, updateDoc, where, orderBy } from 'firebase/firestore';

const productsCollectionRef = collection(db, 'products');
const movementsCollectionRef = collection(db, 'movements');

// --- FUNCIÓN addProduct MODIFICADA ---
export const addProduct = (productData) => {
  // Simplemente devolvemos el resultado de addDoc, que es una promesa.
  return addDoc(productsCollectionRef, productData);
};

export const getProductsRealtime = (callback) => {
  // Ahora la función 'query' está definida y se puede usar.
  const q = query(productsCollectionRef);

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const products = [];
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    callback(products);
  });

  return unsubscribe;
};

export const deleteProduct = (id) => {
  const productDoc = doc(db, "products", id);
  // Devolvemos la promesa para que toast.promise pueda usarla
  return deleteDoc(productDoc);
};


export const updateProduct = (id, productData) => {
  // Obtenemos la referencia al documento que queremos actualizar
  const productDoc = doc(db, "products", id);
  // Devolvemos la promesa de la operación de actualización
  return updateDoc(productDoc, productData);
};

// --- NUEVA FUNCIÓN PARA CREAR UN MOVIMIENTO ---
export const createMovement = (movementData) => {
  // Simplemente añade un nuevo documento a la colección 'movements'
  return addDoc(movementsCollectionRef, movementData);
};

// --- NUEVA FUNCIÓN PARA OBTENER EL HISTORIAL DE UN PRODUCTO ---
export const getProductMovements = (productId, callback) => {
  // Creamos una consulta que busca todos los movimientos...
  const q = query(
    movementsCollectionRef,
    where("productId", "==", productId), // ... que pertenezcan a este producto...
    orderBy("timestamp", "desc") // ... y los ordena del más nuevo al más viejo.
  );

  // Usamos onSnapshot para que el historial se actualice en tiempo real si fuera necesario.
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const movements = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(movements);
  });

  return unsubscribe;
};

// --- NUEVA FUNCIÓN PARA EL DASHBOARD ---
export const getLowStockProductsRealtime = (callback) => {
  // Esta consulta es más compleja: busca productos donde el campo 'stock'
  // sea menor o igual que el campo 'minStock'.
  // NOTA: Firebase no puede comparar dos campos directamente en una consulta.
  // Haremos el filtrado en el cliente, que es eficiente para listas de tamaño moderado.
  const q = query(productsCollectionRef);

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Filtramos los productos en el lado del cliente
    const lowStockProducts = allProducts.filter(p => p.stock > 0 && p.stock <= (p.minStock || 0));
    
    callback(lowStockProducts);
  });
  return unsubscribe;
};