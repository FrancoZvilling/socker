// src/pages/DashboardPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getTodaySalesRealtime,
  getWeekSalesRealtime,
  getMonthSalesRealtime
} from '../services/saleService';
import { getLowStockProductsRealtime } from '../services/productService';
import DashboardCard from '../components/dashboard/DashboardCard';
import { FiTrendingUp, FiPackage, FiCalendar, FiBarChart } from 'react-icons/fi';
import { formatCurrency } from '../utils/formatters';
import './DashboardPage.css';

const DashboardPage = () => {
  const { userData } = useAuth(); // <-- CAMBIO
  const tenantId = userData?.tenantId;

  // Estados para cada una de las métricas (sin cambios)
  const [todaySales, setTodaySales] = useState([]);
  const [weekSales, setWeekSales] = useState([]);
  const [monthSales, setMonthSales] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // El useEffect ahora depende del tenantId y gestiona la limpieza de las suscripciones
  useEffect(() => {
    // No se ejecuta ninguna llamada a la base de datos si el tenantId aún no está disponible
    if (!tenantId) {
      return;
    }

    // Se pasa el tenantId como primer argumento a cada llamada de servicio
    const unsubToday = getTodaySalesRealtime(tenantId, setTodaySales);
    const unsubWeek = getWeekSalesRealtime(tenantId, setWeekSales);
    const unsubMonth = getMonthSalesRealtime(tenantId, setMonthSales);
    const unsubLowStock = getLowStockProductsRealtime(tenantId, (products) => {
      setLowStockProducts(products);
      // Se desactiva la carga una vez que llegan los últimos datos necesarios
      setIsLoading(false); 
    });

    // Función de limpieza: se ejecuta cuando el componente se desmonta o el tenantId cambia.
    // Esto previene fugas de memoria y llamadas innecesarias a la base de datos.
    return () => {
      unsubToday();
      unsubWeek();
      unsubMonth();
      unsubLowStock();
    };
  }, [tenantId]); // El efecto se vuelve a ejecutar si el tenantId cambia

  // useMemo para los cálculos (sin cambios)
  const totalSalesToday = useMemo(() => todaySales.reduce((sum, sale) => sum + sale.total, 0), [todaySales]);
  const totalSalesWeek = useMemo(() => weekSales.reduce((sum, sale) => sum + sale.total, 0), [weekSales]);
  const totalSalesMonth = useMemo(() => monthSales.reduce((sum, sale) => sum + sale.total, 0), [monthSales]);
  
  const lowStockCount = lowStockProducts.length;

  // El JSX renderizado (sin cambios)
  return (
    <div className="dashboard-page">
      <header className="page-header">
        <h1>Dashboard</h1>
      </header>
      <div className="dashboard-grid">
        <DashboardCard
          title="Ventas de Hoy"
          value={formatCurrency(totalSalesToday)}
          icon={<FiTrendingUp />}
          isLoading={isLoading}
        />
        <DashboardCard
          title="Ventas de la Semana"
          value={formatCurrency(totalSalesWeek)}
          icon={<FiCalendar />}
          isLoading={isLoading}
        />
        <DashboardCard
          title="Ventas del Mes"
          value={formatCurrency(totalSalesMonth)}
          icon={<FiBarChart />}
          isLoading={isLoading}
        />
        <DashboardCard
          title="Productos con Stock Bajo"
          value={lowStockCount}
          icon={<FiPackage />}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default DashboardPage;