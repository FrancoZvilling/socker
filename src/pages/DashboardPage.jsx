// src/pages/DashboardPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getTodaySalesRealtime,
  getWeekSalesRealtime,
  getMonthSalesRealtime,
  getSalesForLastNDays
} from '../services/saleService';
import { getLowStockProductsRealtime } from '../services/productService';
import { getSalesAnalytics, getMonthlySalesAnalytics } from '../services/analyticsService';
import DashboardCard from '../components/dashboard/DashboardCard';
import ChartsCarousel from '../components/dashboard/ChartsCarousel';
import CashDrawerIndicator from '../components/dashboard/CashDrawerIndicator'; // Se importa el nuevo indicador
import { FiTrendingUp, FiPackage, FiCalendar, FiBarChart, FiDollarSign } from 'react-icons/fi';
import { formatCurrency } from '../utils/formatters';
import './DashboardPage.css';

const DashboardPage = () => {
  const { userData } = useAuth();
  const tenantId = userData?.tenantId;

  // Estados para métricas y gráficos
  const [todaySales, setTodaySales] = useState([]);
  const [weekSales, setWeekSales] = useState([]);
  const [monthSales, setMonthSales] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [last7DaysSales, setLast7DaysSales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [monthlySalesAnalytics, setMonthlySalesAnalytics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!tenantId) return;

    // Suscripciones a los datos en tiempo real
    const unsubToday = getTodaySalesRealtime(tenantId, setTodaySales);
    const unsubWeek = getWeekSalesRealtime(tenantId, setWeekSales);
    const unsubMonth = getMonthSalesRealtime(tenantId, setMonthSales);
    const unsubLowStock = getLowStockProductsRealtime(tenantId, setLowStockProducts);
    const unsubLast7Days = getSalesForLastNDays(tenantId, 7, setLast7DaysSales);

    // Llamadas únicas a las Cloud Functions para obtener analíticas
    getSalesAnalytics(tenantId)
      .then(result => {
        setTopProducts(result.data.topProducts);
      })
      .catch(error => {
        console.error("Error al obtener top productos:", error);
      });
    
    getMonthlySalesAnalytics(tenantId)
      .then(result => {
        setMonthlySalesAnalytics(result.data.monthlySales);
      })
      .catch(error => {
        console.error("Error al obtener ventas mensuales:", error);
      });

    setTimeout(() => setIsLoading(false), 800);

    return () => {
      unsubToday();
      unsubWeek();
      unsubMonth();
      unsubLowStock();
      unsubLast7Days();
    };
  }, [tenantId]);

  // Cálculos para las tarjetas de métricas
  const totalSalesToday = useMemo(() => todaySales.reduce((sum, sale) => sum + sale.total, 0), [todaySales]);
  const totalSalesWeek = useMemo(() => weekSales.reduce((sum, sale) => sum + sale.total, 0), [weekSales]);
  const totalSalesMonth = useMemo(() => monthSales.reduce((sum, sale) => sum + sale.total, 0), [monthSales]);
  const totalProfitMonth = useMemo(() => monthSales.reduce((sum, sale) => sum + (sale.profit || 0), 0), [monthSales]);
  const lowStockCount = lowStockProducts.length;

  // Cálculo para procesar los datos para el gráfico semanal
  const weeklyChartData = useMemo(() => {
    const days = {};
    const labels = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      labels.push(key);
      days[key] = 0;
    }
    last7DaysSales.forEach(sale => {
      const saleDate = sale.createdAt.toDate();
      const key = `${saleDate.getDate().toString().padStart(2, '0')}/${(saleDate.getMonth() + 1).toString().padStart(2, '0')}`;
      if (days.hasOwnProperty(key)) {
        days[key] += sale.total;
      }
    });
    return {
      labels: labels,
      data: Object.values(days),
    };
  }, [last7DaysSales]);

  return (
    <div className="dashboard-page">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Dashboard</h1>
        <CashDrawerIndicator />
      </header>
      <div className="dashboard-grid">
        {/* Ya no está el CashDrawerStatus aquí */}
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
          title="Ganancia del Mes"
          value={formatCurrency(totalProfitMonth)}
          icon={<FiDollarSign />}
          isLoading={isLoading}
        />
        <DashboardCard
          title="Productos con Stock Bajo"
          value={lowStockCount}
          icon={<FiPackage />}
          isLoading={isLoading}
        />
      </div>
      
      <div className="charts-section">
        <ChartsCarousel 
          weeklyChartData={weeklyChartData}
          topProductsData={topProducts}
          monthlySalesData={monthlySalesAnalytics}
        />
      </div>
    </div>
  );
};

export default DashboardPage;