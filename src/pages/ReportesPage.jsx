// src/pages/ReportesPage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBusiness } from '../context/BusinessContext'; // Se importa para obtener los datos del negocio
import { getSalesRealtime } from '../services/saleService';
import { generateReceiptPDF } from '../utils/receiptGenerator'; // Se importa la función para generar PDFs
import SalesTable from '../components/reportes/SalesTable';
import SaleDetailsModal from '../components/reportes/SaleDetailsModal';
import { toast } from 'react-hot-toast';
import './ReportesPage.css';

const ReportesPage = () => {
  const { userData } = useAuth();
  const { businessData } = useBusiness(); // Se obtiene la información del negocio (nombre, etc.)
  const tenantId = userData?.tenantId;

  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');

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

  // Se añade la nueva función para manejar la impresión
  const handlePrintReceipt = (sale) => {
    if (!businessData) {
      toast.error("Datos del negocio no cargados. Intente de nuevo.");
      return;
    }
    generateReceiptPDF(businessData, sale);
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
        // Se pasa la nueva función 'onPrint' a la tabla
        <SalesTable
          sales={sales}
          onShowDetails={handleShowDetails}
          onPrint={handlePrintReceipt}
        />
      )}

      {isDetailsModalOpen && (
        <SaleDetailsModal sale={selectedSale} onClose={handleCloseDetailsModal} />
      )}
    </div>
  );
};

export default ReportesPage;