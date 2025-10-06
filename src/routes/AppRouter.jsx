// src/routes/AppRouter.jsx

import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';


// Layout y Páginas
import MainLayout from '../layouts/MainLayout';
import DashboardPage from '../pages/DashboardPage';
import InventarioPage from '../pages/InventarioPage';
import VentasPage from '../pages/VentasPage';
import ReportesPage from '../pages/ReportesPage';
import ProveedoresPage from '../pages/ProveedoresPage';
import ClientesPage from '../pages/ClientesPage';
import SuperAdminPage from '../pages/SuperAdminPage';
import FinalizarRegistroPage from '../pages/FinalizarRegistroPage';
import PromocionesPage from '../pages/PromocionesPage';
import FinanzasPage from '../pages/FinanzasPage';
import CajaPage from '../pages/CajaPage';
import ConfiguracionPage from '../pages/ConfiguracionPage';
import PresupuestosPage from '../pages/PresupuestosPage';

// Componentes de Rutas Protegidas
import SuperAdminRoute from './SuperAdminRoute';

const router = createBrowserRouter([
  // Se define una única ruta raíz que renderiza el Layout principal.
  // MainLayout se encargará de mostrar la Landing Page o el contenido protegido.
  {
    path: '/',
    element: <MainLayout />,
    // Todas las páginas de la aplicación ahora son hijas de esta ruta raíz.
    children: [
      {
        index: true, 
        element: <Navigate to="/ventas" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'inventario',
        element: <InventarioPage />,
      },
      {
        path: 'ventas',
        element: <VentasPage />,
      },
      {
        path: 'reportes',
        element: <ReportesPage />
      },
      {
        path: 'proveedores',
        element: <ProveedoresPage />
      },
      {
        path: 'clientes',
        element: <ClientesPage />
      },
      {
        path: 'promociones',
        element: <PromocionesPage />
      },
      // Nueva ruta para el panel de Super Admin, protegida por su guardia.
      {
        path: 'super-admin',
        element: (
          <SuperAdminRoute>
            <SuperAdminPage />
          </SuperAdminRoute>
        )
      },
      {
        path: '/finalizar-registro', // <-- NUEVA RUTA PÚBLICA
        element: <FinalizarRegistroPage />
      },
      { 
        path: 'finanzas', 
        element: <FinanzasPage /> 
      },
      { 
        path: 'caja', 
        element: <CajaPage /> 
      },
      { 
        path: 'configuracion', 
        element: <ConfiguracionPage /> 
      },
      {
        path: 'presupuestos',
        element: <PresupuestosPage />
      },
    ],
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;