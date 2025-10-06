// src/pages/CajaPage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getActiveCashSessionRealtime, 
  openCashDrawer, 
  closeCashDrawer, 
  getCashSalesForActiveSession,
  getClosedCashSessions // Se importa la nueva función para el historial
} from '../services/cashService';
import CashDrawerStatus from '../components/dashboard/CashDrawerStatus';
import OpenCashDrawerModal from '../components/caja/OpenCashDrawerModal';
import CloseCashDrawerModal from '../components/caja/CloseCashDrawerModal';
import SessionHistoryTable from '../components/caja/SessionHistoryTable'; // Se importa la nueva tabla
import Button from '../components/common/Button'; // Se importa el componente Button
import { toast } from 'react-hot-toast';
import './CajaPage.css';

const CajaPage = () => {
  const { userData, currentUser } = useAuth();
  const tenantId = userData?.tenantId;

  // Estados para la sesión activa
  const [activeSession, setActiveSession] = useState(null);
  const [isCashLoading, setIsCashLoading] = useState(true);
  const [isOpeningModal, setIsOpeningModal] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [sessionDataForClosing, setSessionDataForClosing] = useState(null);
  
  // Estados para el historial
  const [closedSessions, setClosedSessions] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filter, setFilter] = useState({ start: null, end: null });

  useEffect(() => {
    if (!tenantId) return;

    // Suscripción para la caja activa (sin cambios)
    const unsubscribeActive = getActiveCashSessionRealtime(tenantId, (session) => {
      setActiveSession(session);
      setIsCashLoading(false);
    });

    // Suscripción para el historial de cajas cerradas
    setIsHistoryLoading(true);
    const unsubscribeHistory = getClosedCashSessions(tenantId, filter, (sessions) => {
      setClosedSessions(sessions);
      setIsHistoryLoading(false);
    });

    return () => {
      unsubscribeActive();
      unsubscribeHistory();
    };
  }, [tenantId, filter]); // Se vuelve a ejecutar si el filtro cambia

  // Handlers para el filtro
  const handleApplyFilter = () => {
    setFilter({ start: startDate, end: endDate });
  };
  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    setFilter({ start: null, end: null });
  };
  
  // Handlers para abrir/cerrar caja (sin cambios)
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
    setIsCashLoading(true);
    const salesInCash = await getCashSalesForActiveSession(tenantId, activeSession.openedAt.toDate());
    const expected = activeSession.openingAmount + salesInCash;
    setSessionDataForClosing({ ...activeSession, totalSalesInCash: salesInCash, expectedInCash: expected });
    setIsClosingModal(true);
    setIsCashLoading(false);
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

  

  return (
    <div className="cash-drawer-page">
      <header className="page-header">
        <h1>Gestión de Caja</h1>
      </header>

      <div className="current-status-container">
        <CashDrawerStatus
          activeSession={activeSession}
          isLoading={isCashLoading}
          onOpen={() => setIsOpeningModal(true)}
          onClose={handlePrepareCloseDrawer}
        />
      </div>

      <div className="history-section">
        <h2>Historial de Sesiones</h2>
        
        <div className="filters-container-reports">
          <div className="date-filter">
            <label htmlFor="start-date">Desde:</label>
            <input type="date" id="start-date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <label htmlFor="end-date">Hasta:</label>
            <input type="date" id="end-date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            <Button onClick={handleApplyFilter} type="primary" disabled={!startDate || !endDate}>
              Filtrar
            </Button>
          </div>
          <button className="clear-filter-btn" onClick={handleClearFilter} disabled={!filter.start}>
            Limpiar Filtro
          </button>
        </div>

        {isHistoryLoading ? (
          <p>Cargando historial...</p>
        ) : (
          <SessionHistoryTable sessions={closedSessions} />
        )}
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

export default CajaPage;