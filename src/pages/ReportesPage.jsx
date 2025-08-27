// src/pages/ReportesPage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSalesRealtime } from '../services/saleService';
import SalesTable from '../components/reportes/SalesTable';
import SaleDetailsModal from '../components/reportes/SaleDetailsModal';
import './ReportesPage.css';

const ReportesPage = () => {
  const { userData } = useAuth(); // <-- CAMBIO
  const tenantId = userData?.tenantId;

  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    if (!tenantId) return; // No hacer nada si no hay tenantId

    setIsLoading(true);
    // --- 3. Pasa el tenantId a la llamada del servicio ---
    const unsubscribe = getSalesRealtime(tenantId, (fetchedSales) => {
      setSales(fetchedSales);
      setIsLoading(false);
    }, selectedDate);

    return () => unsubscribe();
  }, [selectedDate, tenantId]); // <-- 4. El efecto ahora depende también de tenantId

  const handleShowDetails = (sale) => {
    setSelectedSale(sale);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedSale(null);
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
        <SalesTable sales={sales} onShowDetails={handleShowDetails} />
      )}

      {isDetailsModalOpen && (
        <SaleDetailsModal sale={selectedSale} onClose={handleCloseDetailsModal} />
      )}
    </div>
  );
};

export default ReportesPage;