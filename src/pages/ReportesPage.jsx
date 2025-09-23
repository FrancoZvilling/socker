// src/pages/ReportesPage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBusiness } from '../context/BusinessContext';
import { getSalesRealtime } from '../services/saleService';
import { processReturn } from '../services/returnService';
import { generateReceiptPDF } from '../utils/receiptGenerator';
import SalesTable from '../components/reportes/SalesTable';
import SaleDetailsModal from '../components/reportes/SaleDetailsModal';
import ReturnModal from '../components/devoluciones/ReturnModal';
import Button from '../components/common/Button'; // Se importa el componente Button
import { toast } from 'react-hot-toast';
import './ReportesPage.css';

const ReportesPage = () => {
  const { userData, currentUser } = useAuth(); 
  const { businessData } = useBusiness();
  const tenantId = userData?.tenantId;

  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  
  // Se reemplaza 'selectedDate' por los nuevos estados para el rango
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filter, setFilter] = useState({ start: null, end: null });

  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [saleToReturn, setSaleToReturn] = useState(null);

  useEffect(() => {
    if (!tenantId) return;
    setIsLoading(true);
    // El efecto ahora depende del estado 'filter' y le pasa el rango de fechas al servicio
    const unsubscribe = getSalesRealtime(tenantId, (fetchedSales) => {
      setSales(fetchedSales);
      setIsLoading(false);
    }, filter);
    return () => unsubscribe();
  }, [filter, tenantId]);

  const handleApplyFilter = () => {
    // Valida que la fecha de fin no sea anterior a la de inicio
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      toast.error('La fecha "Hasta" no puede ser anterior a la fecha "Desde".');
      return;
    }
    setFilter({ start: startDate, end: endDate });
  };

  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    setFilter({ start: null, end: null });
  };

  const handleShowDetails = (sale) => {
    setSelectedSale(sale);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedSale(null);
  };

  const handlePrintReceipt = (sale) => {
    if (!businessData) {
      toast.error("Datos del negocio no cargados. Intente de nuevo.");
      return;
    }
    generateReceiptPDF(businessData, sale);
  };

  const handleOpenReturnModal = (sale) => {
    setSaleToReturn(sale);
    setIsReturnModalOpen(true);
  };

  const handleProcessReturn = (returnData) => {
    const finalReturnData = {
      ...returnData,
      processedBy: { uid: currentUser.uid, email: currentUser.email }
    };
    const promise = processReturn(tenantId, finalReturnData);
    toast.promise(promise, {
      loading: 'Procesando devolución...',
      success: <b>¡Devolución registrada!</b>,
      error: <b>Error al registrar la devolución.</b>
    });
    promise.then(() => setIsReturnModalOpen(false));
  };

  return (
    <div className="reports-page">
      <header className="page-header">
        <h1>Historial de Ventas</h1>
      </header>
      
      {/* Se actualiza el contenedor de filtros con los dos inputs y el nuevo botón */}
      <div className="filters-container-reports">
        <div className="date-filter">
          <label htmlFor="start-date">Desde:</label>
          <input
            type="date"
            id="start-date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <label htmlFor="end-date">Hasta:</label>
          <input
            type="date"
            id="end-date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <Button onClick={handleApplyFilter} type="primary" disabled={!startDate || !endDate}>
            Aplicar Filtro
          </Button>
        </div>
        <button 
          className="clear-filter-btn" 
          onClick={handleClearFilter}
          disabled={!filter.start && !filter.end}
        >
          Mostrar Todo
        </button>
      </div>

      {isLoading ? (
        <p>Cargando historial de ventas...</p>
      ) : (
        <SalesTable
          sales={sales}
          onShowDetails={handleShowDetails}
          onPrint={handlePrintReceipt}
          onReturn={handleOpenReturnModal}
        />
      )}

      {isDetailsModalOpen && (
        <SaleDetailsModal sale={selectedSale} onClose={handleCloseDetailsModal} />
      )}

      {isReturnModalOpen && (
        <ReturnModal
          isOpen={isReturnModalOpen}
          onClose={() => setIsReturnModalOpen(false)}
          saleData={saleToReturn}
          onSubmitReturn={handleProcessReturn}
        />
      )}
    </div>
  );
};

export default ReportesPage;