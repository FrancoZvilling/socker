// src/pages/DashboardPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
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
  // Estados para cada una de las métricas
  const [todaySales, setTodaySales] = useState([]);
  const [weekSales, setWeekSales] = useState([]);
  const [monthSales, setMonthSales] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Un array de promesas para controlar cuando todas las cargas iniciales han terminado
    const initialLoads = [
      new Promise(resolve => getTodaySalesRealtime(sales => { setTodaySales(sales); resolve(); })),
      new Promise(resolve => getWeekSalesRealtime(sales => { setWeekSales(sales); resolve(); })),
      new Promise(resolve => getMonthSalesRealtime(sales => { setMonthSales(sales); resolve(); })),
      new Promise(resolve => getLowStockProductsRealtime(products => { setLowStockProducts(products); resolve(); })),
    ];
    
    // Cuando todas las promesas del array se resuelven, cambiamos el estado de carga
    Promise.all(initialLoads).then(() => setIsLoading(false));

    // Nota: para una aplicación en producción a gran escala, sería ideal guardar 
    // las funciones de 'unsubscribe' y llamarlas aquí en el retorno del useEffect
    // para limpiar las suscripciones cuando el componente se desmonte.
  }, []);

  // Usamos useMemo para calcular los totales solo cuando los datos relevantes cambian
  const totalSalesToday = useMemo(() => todaySales.reduce((sum, sale) => sum + sale.total, 0), [todaySales]);
  const totalSalesWeek = useMemo(() => weekSales.reduce((sum, sale) => sum + sale.total, 0), [weekSales]);
  const totalSalesMonth = useMemo(() => monthSales.reduce((sum, sale) => sum + sale.total, 0), [monthSales]);
  
  // Simplemente contamos la cantidad de productos en el array de stock bajo
  const lowStockCount = lowStockProducts.length;

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