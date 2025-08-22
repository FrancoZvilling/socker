// src/pages/ReportesPage.jsx
import React, { useState, useEffect } from 'react';
import { getSalesRealtime } from '../services/saleService';
import SalesTable from '../components/reportes/SalesTable';
import SaleDetailsModal from '../components/reportes/SaleDetailsModal';
import './ReportesPage.css';

const ReportesPage = () => {
  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = getSalesRealtime((fetchedSales) => {
      setSales(fetchedSales);
      setIsLoading(false);
    }, selectedDate);

    return () => unsubscribe();
  }, [selectedDate]);

  // --- LÓGICA RESTAURADA ---
  const handleShowDetails = (sale) => {
    setSelectedSale(sale);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedSale(null); // Limpiamos el estado al cerrar
  };
  // -------------------------

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
        // La prop 'onShowDetails' ya estaba siendo pasada, ahora la función a la que apunta tiene lógica.
        <SalesTable sales={sales} onShowDetails={handleShowDetails} />
      )}

      {isDetailsModalOpen && (
        <SaleDetailsModal sale={selectedSale} onClose={handleCloseDetailsModal} />
      )}
    </div>
  );
};

export default ReportesPage;