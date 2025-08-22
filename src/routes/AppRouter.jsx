import { createBrowserRouter, RouterProvider } from 'react-router-dom';
    import MainLayout from '../layouts/MainLayout';
    import DashboardPage from '../pages/DashboardPage';
    import InventarioPage from '../pages/InventarioPage';
    import VentasPage from '../pages/VentasPage';
    import ReportesPage from '../pages/ReportesPage';
    import ProveedoresPage from '../pages/ProveedoresPage';
    import ClientesPage from '../pages/ClientesPage';

    const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'inventario',
        element: <InventarioPage />,
      },
      { // <-- NUEVO BLOQUE: Añadimos la ruta de ventas
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
    ],
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;