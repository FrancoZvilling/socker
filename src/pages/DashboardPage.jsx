// src/pages/DashboardPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getTodaySalesRealtime,
  getWeekSalesRealtime,
  getMonthSalesRealtime
} from '../services/saleService';
import { getLowStockProductsRealtime } from '../services/productService';
import { 
  getActiveCashSessionRealtime, 
  openCashDrawer, 
  closeCashDrawer, 
  getCashSalesForActiveSession 
} from '../services/cashService';
import DashboardCard from '../components/dashboard/DashboardCard';
import CashDrawerStatus from '../components/dashboard/CashDrawerStatus';
import OpenCashDrawerModal from '../components/caja/OpenCashDrawerModal';
import CloseCashDrawerModal from '../components/caja/CloseCashDrawerModal';
import { FiTrendingUp, FiPackage, FiCalendar, FiBarChart, FiDollarSign } from 'react-icons/fi';
import { formatCurrency } from '../utils/formatters';
import { toast } from 'react-hot-toast';
import './DashboardPage.css';

const DashboardPage = () => {
  const { userData, currentUser } = useAuth();
  const tenantId = userData?.tenantId;

  // Estados para las tarjetas de métricas
  const [todaySales, setTodaySales] = useState([]);
  const [weekSales, setWeekSales] = useState([]);
  const [monthSales, setMonthSales] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para la gestión de caja
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

    // Desactiva la carga principal una vez que todos los datos iniciales deberían haber llegado
    setTimeout(() => setIsLoading(false), 800);

    return () => {
      // Limpieza de todas las suscripciones
      unsubToday();
      unsubWeek();
      unsubMonth();
      unsubLowStock();
      unsubSession();
    };
  }, [tenantId]);

  // Handlers para la gestión de caja
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

  // Cálculos para las tarjetas de métricas
  const totalSalesToday = useMemo(() => todaySales.reduce((sum, sale) => sum + sale.total, 0), [todaySales]);
  const totalSalesWeek = useMemo(() => weekSales.reduce((sum, sale) => sum + sale.total, 0), [weekSales]);
  const totalSalesMonth = useMemo(() => monthSales.reduce((sum, sale) => sum + sale.total, 0), [monthSales]);
  const totalProfitMonth = useMemo(() => monthSales.reduce((sum, sale) => sum + (sale.profit || 0), 0), [monthSales]);
  const lowStockCount = lowStockProducts.length;

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