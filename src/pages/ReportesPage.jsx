// src/pages/ReportesPage.jsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBusiness } from '../context/BusinessContext';
import { getTodaySalesRealtime, getSalesByDateRange } from '../services/saleService';
import { processReturn } from '../services/returnService';
import { generateReceiptPDF } from '../utils/receiptGenerator';
import ReactPaginate from 'react-paginate';
import SalesTable from '../components/reportes/SalesTable';
import SaleDetailsModal from '../components/reportes/SaleDetailsModal';
import ReturnModal from '../components/devoluciones/ReturnModal';
import Button from '../components/common/Button';
import { toast } from 'react-hot-toast';
import './ReportesPage.css';
import '../pages/InventarioPage.css';

const ReportesPage = () => {
  const { userData, currentUser } = useAuth(); 
  const { businessData } = useBusiness();
  const tenantId = userData?.tenantId;

  const [displayedSales, setDisplayedSales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [saleToReturn, setSaleToReturn] = useState(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Efecto para la carga inicial y en tiempo real de las ventas del día
  useEffect(() => {
    if (!tenantId) return;

    setIsLoading(true);
    // Esta suscripción se mantiene activa para las ventas del día
    const unsubscribe = getTodaySalesRealtime(tenantId, (fetchedSales) => {
      // Solo actualiza si no estamos en medio de una búsqueda filtrada
      if (!startDate && !endDate) {
        setDisplayedSales(fetchedSales);
      }
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, [tenantId, startDate, endDate]); // Depende de las fechas para saber si debe actuar

  // Función para buscar por rango de fechas
  const handleApplyFilter = async () => {
    if (!startDate || !endDate) {
      toast.error("Por favor, seleccione ambas fechas."); return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      toast.error('La fecha "Hasta" no puede ser anterior a la fecha "Desde".'); return;
    }

    setIsSearching(true);
    try {
      const fetchedSales = await getSalesByDateRange(tenantId, startDate, endDate);
      setDisplayedSales(fetchedSales);
      setCurrentPage(0);
    } catch (error) {
      console.error("Error al buscar ventas por rango:", error);
      toast.error("No se pudieron cargar las ventas para ese rango.");
    } finally {
      setIsSearching(false);
    }
  };

  // Función para limpiar el filtro y volver a las ventas del día
  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    // Al limpiar las fechas, el useEffect se encargará de volver a suscribirse
    // a las ventas del día, no necesitamos lógica extra aquí.
  };

  // Lógica de paginación del lado del cliente
  const pageCount = Math.ceil(displayedSales.length / pageSize);
  const offset = currentPage * pageSize;
  const currentSales = displayedSales.slice(offset, offset + pageSize);
  const handlePageClick = ({ selected }) => setCurrentPage(selected);
  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(0);
  };
  
  const handleShowDetails = (sale) => { setSelectedSale(sale); setIsDetailsModalOpen(true); };
  const handleCloseDetailsModal = () => { setIsDetailsModalOpen(false); setSelectedSale(null); };
  const handlePrintReceipt = (sale) => { if (businessData) generateReceiptPDF(businessData, sale); };
  const handleOpenReturnModal = (sale) => { setSaleToReturn(sale); setIsReturnModalOpen(true); };
  const handleProcessReturn = (returnData) => {
    const finalReturnData = { ...returnData, processedBy: { uid: currentUser.uid, email: currentUser.email } };
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
      <header className="page-header"><h1>Historial de Ventas</h1></header>
      
      <div className="filters-container-reports">
        <div className="date-filter">
          <label htmlFor="start-date">Desde:</label>
          <input type="date" id="start-date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <label htmlFor="end-date">Hasta:</label>
          <input type="date" id="end-date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <Button onClick={handleApplyFilter} type="primary" disabled={!startDate || !endDate}>
            Aplicar Filtro
          </Button>
        </div>
        <button className="clear-filter-btn" onClick={handleClearFilter} disabled={!startDate && !endDate}>
          Mostrar Todo
        </button>
      </div>

      {(isLoading || isSearching) ? (
        <p>{isSearching ? 'Buscando en el historial...' : 'Cargando ventas de hoy...'}</p>
      ) : (
        <>
          <SalesTable sales={currentSales} onShowDetails={handleShowDetails} onPrint={handlePrintReceipt} onReturn={handleOpenReturnModal} />
          {pageCount > 1 && (
            <div className="pagination-container">
              <ReactPaginate
                previousLabel={'< Anterior'} nextLabel={'Siguiente >'} breakLabel={'...'}
                pageCount={pageCount} marginPagesDisplayed={2} pageRangeDisplayed={3}
                onPageChange={handlePageClick} containerClassName={'pagination'} activeClassName={'active'}
                forcePage={currentPage}
              />
              <div className="page-size-selector">
                <select value={pageSize} onChange={handlePageSizeChange}>
                  <option value={10}>Mostrar 10</option>
                  <option value={25}>Mostrar 25</option>
                  <option value={50}>Mostrar 50</option>
                  <option value={100}>Mostrar 100</option>
                </select>
              </div>
            </div>
          )}
        </>
      )}

      {isDetailsModalOpen && ( <SaleDetailsModal sale={selectedSale} onClose={handleCloseDetailsModal} /> )}
      {isReturnModalOpen && ( <ReturnModal isOpen={isReturnModalOpen} onClose={() => setIsReturnModalOpen(false)} saleData={saleToReturn} onSubmitReturn={handleProcessReturn} /> )}
    </div>
  );
};

export default ReportesPage;