// src/config/permissions.js

// Definimos una lista de todos los permisos posibles en la aplicación.
export const PERMISSIONS = {
  // Inventario
  VIEW_INVENTORY: 'view_inventory',
  MANAGE_PRODUCTS: 'manage_products', // Crear, editar, borrar productos
  VIEW_COST_PRICE: 'view_cost_price', // Ver el precio de costo
  REGISTER_PURCHASES: 'register_purchases',
  
  // Ventas
  USE_POS: 'use_pos',

  // Reportes
  VIEW_REPORTS: 'view_reports',

  // Proveedores
  MANAGE_SUPPLIERS: 'manage_suppliers',

  // Clientes
  MANAGE_CLIENTS: 'manage_clients',
  MANAGE_CREDIT: 'manage_credit', // Ver y gestionar cuentas corrientes

  // Administración del Negocio (futuro)
  MANAGE_USERS: 'manage_users',
};

// Asignamos los permisos a cada rol.
const ROLES = {
  admin: [
    // El admin puede hacer todo
    ...Object.values(PERMISSIONS), // Object.values(PERMISSIONS) crea un array con todos los permisos
  ],
  vendedor: [
    // El vendedor tiene un acceso más limitado
    PERMISSIONS.VIEW_INVENTORY, // Puede ver la lista de productos
    PERMISSIONS.USE_POS,        // Puede usar la pantalla de ventas
    PERMISSIONS.MANAGE_CLIENTS, // Puede crear y buscar clientes para las ventas
  ],
};

export default ROLES;