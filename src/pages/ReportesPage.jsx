// src/pages/ReportesPage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBusiness } from '../context/BusinessContext';
import { getSalesRealtime } from '../services/saleService';
import { processReturn } from '../services/returnService'; // Se importa el nuevo servicio
import { generateReceiptPDF } from '../utils/receiptGenerator';
import SalesTable from '../components/reportes/SalesTable';
import SaleDetailsModal from '../components/reportes/SaleDetailsModal';
import ReturnModal from '../components/devoluciones/ReturnModal'; // Se importa el nuevo modal
import { toast } from 'react-hot-toast';
import './ReportesPage.css';

const ReportesPage = () => {
  // Se obtiene 'currentUser' para registrar quién hizo la devolución
  const { userData, currentUser } = useAuth(); 
  const { businessData } = useBusiness();
  const tenantId = userData?.tenantId;

  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');

  // Se añaden los nuevos estados para el modal de devolución
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [saleToReturn, setSaleToReturn] = useState(null);

  useEffect(() => {
    if (!tenantId) return;
    setIsLoading(true);
    const unsubscribe = getSalesRealtime(tenantId, (fetchedSales) => {
      setSales(fetchedSales);
      setIsLoading(false);
    }, selectedDate);
    return () => unsubscribe();
  }, [selectedDate, tenantId]);

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

  // Se añaden las nuevas funciones para manejar el flujo de devoluciones
  const handleOpenReturnModal = (sale) => {
    setSaleToReturn(sale);
    setIsReturnModalOpen(true);
  };

  const handleProcessReturn = (returnData) => {
    // Se añade la información del usuario que procesa la devolución
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
      
      <div className="filters-container-reports">
        <div className="date-filter">
          <label htmlFor="sale-date">Filtrar por fecha:</label>
          <input
            type="date"
            id="sale-date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        <button 
          className="clear-filter-btn" 
          onClick={() => setSelectedDate('')} 
          disabled={!selectedDate}
        >
          Mostrar Todo
        </button>
      </div>

      {isLoading ? (
        <p>Cargando historial de ventas...</p>
      ) : (
        // Se pasa la nueva función 'onReturn' a la tabla
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

      {/* Se renderiza el nuevo modal de devolución */}
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