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
import { 
  getActiveCashSessionRealtime, 
  openCashDrawer, 
  closeCashDrawer, 
  getCashSalesForActiveSession 
} from '../services/cashService';
import { getSalesAnalytics, getMonthlySalesAnalytics } from '../services/analyticsService'; // Se añade la nueva función
import DashboardCard from '../components/dashboard/DashboardCard';
import CashDrawerStatus from '../components/dashboard/CashDrawerStatus';
import OpenCashDrawerModal from '../components/caja/OpenCashDrawerModal';
import CloseCashDrawerModal from '../components/caja/CloseCashDrawerModal';
import ChartsCarousel from '../components/dashboard/ChartsCarousel';
import { FiTrendingUp, FiPackage, FiCalendar, FiBarChart, FiDollarSign } from 'react-icons/fi';
import { formatCurrency } from '../utils/formatters';
import { toast } from 'react-hot-toast';
import './DashboardPage.css';

const DashboardPage = () => {
  const { userData, currentUser } = useAuth();
  const tenantId = userData?.tenantId;

  // Estados para métricas y gráficos
  const [todaySales, setTodaySales] = useState([]);
  const [weekSales, setWeekSales] = useState([]);
  const [monthSales, setMonthSales] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [last7DaysSales, setLast7DaysSales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [monthlySalesAnalytics, setMonthlySalesAnalytics] = useState([]); // Nuevo estado para el gráfico mensual
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para gestión de caja
  const [activeSession, setActiveSession] = useState(null);
  const [isCashLoading, setIsCashLoading] = useState(true);
  const [isOpeningModal, setIsOpeningModal] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [sessionDataForClosing, setSessionDataForClosing] = useState(null);

  useEffect(() => {
    if (!tenantId) return;

    // Suscripciones a los datos en tiempo real
    const unsubToday = getTodaySalesRealtime(tenantId, setTodaySales);
    const unsubWeek = getWeekSalesRealtime(tenantId, setWeekSales);
    const unsubMonth = getMonthSalesRealtime(tenantId, setMonthSales);
    const unsubLowStock = getLowStockProductsRealtime(tenantId, setLowStockProducts);
    const unsubSession = getActiveCashSessionRealtime(tenantId, (session) => {
      setActiveSession(session);
      setIsCashLoading(false);
    });
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
      unsubSession();
      unsubLast7Days();
    };
  }, [tenantId]);

  // Handlers para la gestión de caja (sin cambios)
  const handleOpenCashDrawer = (openingAmount) => {
    const promise = openCashDrawer(tenantId, openingAmount, currentUser);
    toast.promise(promise, {
      loading: 'Abriendo caja...',
      success: '¡Caja abierta con éxito!',
      error: 'Hubo un error al abrir la caja.',
    });
    promise.then(() => setIsOpeningModal(false));
  };

  const handlePrepareCloseDrawer = async () => {
    if (!activeSession) return;
    const salesInCash = await getCashSalesForActiveSession(tenantId, activeSession.openedAt.toDate());
    const expected = activeSession.openingAmount + salesInCash;
    setSessionDataForClosing({ ...activeSession, totalSalesInCash: salesInCash, expectedInCash: expected });
    setIsClosingModal(true);
  };

  const handleCloseCashDrawer = (countedAmount) => {
    const { id, expectedInCash, totalSalesInCash } = sessionDataForClosing;
    const promise = closeCashDrawer(tenantId, id, countedAmount, expectedInCash, totalSalesInCash, currentUser);
    toast.promise(promise, {
      loading: 'Cerrando y guardando sesión...',
      success: '¡Caja cerrada con éxito!',
      error: 'Hubo un error al cerrar la caja.',
    });
    promise.then(() => setIsClosingModal(false));
  };

  // Cálculos para las tarjetas de métricas (sin cambios)
  const totalSalesToday = useMemo(() => todaySales.reduce((sum, sale) => sum + sale.total, 0), [todaySales]);
  const totalSalesWeek = useMemo(() => weekSales.reduce((sum, sale) => sum + sale.total, 0), [weekSales]);
  const totalSalesMonth = useMemo(() => monthSales.reduce((sum, sale) => sum + sale.total, 0), [monthSales]);
  const totalProfitMonth = useMemo(() => monthSales.reduce((sum, sale) => sum + (sale.profit || 0), 0), [monthSales]);
  const lowStockCount = lowStockProducts.length;

  // Cálculo para procesar los datos para el gráfico semanal (sin cambios)
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
      <header className="page-header">
        <h1>Dashboard</h1>
      </header>
      <div className="dashboard-grid">
        <div className="cash-drawer-wrapper">
          <CashDrawerStatus
            activeSession={activeSession}
            isLoading={isCashLoading}
            onOpen={() => setIsOpeningModal(true)}
            onClose={handlePrepareCloseDrawer}
          />
        </div>
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
          monthlySalesData={monthlySalesAnalytics} // Se pasan los datos del nuevo gráfico
        />
      </div>
      
      {isOpeningModal && (
        <OpenCashDrawerModal
          isOpen={isOpeningModal}
          onClose={() => setIsOpeningModal(false)}
          onOpen={handleOpenCashDrawer}
        />
      )}
      
      {isClosingModal && sessionDataForClosing && (
        <CloseCashDrawerModal
          isOpen={isClosingModal}
          onClose={() => setIsClosingModal(false)}
          onCloseDrawer={handleCloseCashDrawer}
          sessionData={sessionDataForClosing}
        />
      )}
    </div>
  );
};

export default DashboardPage;