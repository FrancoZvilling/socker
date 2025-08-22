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
  const [selectedDate, setSelectedDate] = useState(''); // <-- 1. Estado para la fecha

  // --- 2. useEffect MODIFICADO ---
  // Ahora depende de 'selectedDate'. Se ejecutará cada vez que la fecha cambie.
  useEffect(() => {
    setIsLoading(true); // Mostramos el indicador de carga al cambiar de fecha
    // Pasamos la fecha seleccionada a nuestro servicio
    const unsubscribe = getSalesRealtime((fetchedSales) => {
      setSales(fetchedSales);
      setIsLoading(false);
    }, selectedDate); // <-- Pasamos la fecha

    return () => unsubscribe();
  }, [selectedDate]); // <-- El efecto se reactiva si 'selectedDate' cambia

  const handleShowDetails = (sale) => { /* ... (sin cambios) */ };
  const handleCloseDetailsModal = () => { /* ... (sin cambios) */ };

  return (
    <div className="reports-page">
      <header className="page-header">
        <h1>Historial de Ventas</h1>
      </header>
      
      {/* --- 3. NUEVA SECCIÓN DE FILTRO DE FECHA --- */}
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