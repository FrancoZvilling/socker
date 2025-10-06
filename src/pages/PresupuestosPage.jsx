// src/pages/PresupuestosPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBusiness } from '../context/BusinessContext';
import { useNavigate } from 'react-router-dom'; // Se añade useNavigate para la redirección
import { getTodayQuotesRealtime, getQuotesByDateRange, addQuote, updateQuote, deleteQuote } from '../services/quoteService';
import { getProductsRealtime } from '../services/productService';
import { getCombosRealtime } from '../services/comboService';
import { getClientsRealtime } from '../services/clientService';
import { generateQuotePDF } from '../utils/receiptGenerator';
import ReactPaginate from 'react-paginate';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { FiPlus } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import QuoteTable from '../components/presupuestos/QuoteTable';
import QuoteEditorModal from '../components/presupuestos/QuoteEditorModal';
import QuoteDetailsModal from '../components/presupuestos/QuoteDetailsModal';
import './ReportesPage.css';

const PresupuestosPage = () => {
  const { userData } = useAuth();
  const { businessData } = useBusiness();
  const tenantId = userData?.tenantId;
  const navigate = useNavigate(); // Se inicializa el hook de navegación
  
  const [quotes, setQuotes] = useState([]);
  const [products, setProducts] = useState([]);
  const [combos, setCombos] = useState([]);
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filter, setFilter] = useState({ start: null, end: null });

  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [quoteToEdit, setQuoteToEdit] = useState(null);
  
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);

  useEffect(() => {
    if (!tenantId) return;
    let unsubscribeQuotes = () => {};
    setIsLoading(true);
    if (filter.start && filter.end) {
      getQuotesByDateRange(tenantId, filter.start, filter.end)
        .then(fetchedQuotes => setQuotes(fetchedQuotes))
        .catch(err => toast.error("Error al buscar presupuestos."))
        .finally(() => setIsLoading(false));
    } else {
      unsubscribeQuotes = getTodayQuotesRealtime(tenantId, (fetchedQuotes) => {
        setQuotes(fetchedQuotes);
        setIsLoading(false);
      });
    }
    const unsubProducts = getProductsRealtime(tenantId, setProducts);
    const unsubCombos = getCombosRealtime(tenantId, setCombos);
    const unsubClients = getClientsRealtime(tenantId, setClients);
    return () => {
      unsubscribeQuotes();
      unsubProducts();
      unsubCombos();
      unsubClients();
    };
  }, [tenantId, filter]);
  
  const handleApplyFilter = () => {
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      toast.error('La fecha "Hasta" no puede ser anterior a la fecha "Desde".');
      return;
    }
    setCurrentPage(0);
    setFilter({ start: startDate, end: endDate });
  };

  const handleClearFilter = () => {
    setCurrentPage(0);
    setStartDate('');
    setEndDate('');
    setFilter({ start: null, end: null });
  };
  
  const handlePageClick = ({ selected }) => setCurrentPage(selected);

  const handleOpenEditorModal = (quote = null) => {
    setQuoteToEdit(quote);
    setIsEditorModalOpen(true);
  };
  const handleCloseEditorModal = () => {
    setQuoteToEdit(null);
    setIsEditorModalOpen(false);
  };

  const handleFormSubmit = (quoteData) => {
    let promise;
    if (quoteToEdit) {
      promise = updateQuote(tenantId, quoteToEdit.id, quoteData);
      toast.promise(promise, { loading: 'Actualizando...', success: '¡Presupuesto actualizado!', error: 'Error.'});
    } else {
      promise = addQuote(tenantId, quoteData);
      toast.promise(promise, { loading: 'Guardando...', success: '¡Presupuesto guardado!', error: 'Error.'});
    }
    promise.then(handleCloseEditorModal);
  };

  const handleDeleteQuote = (id) => {
    Swal.fire({
      title: '¿Estás seguro?', text: "Se eliminará este presupuesto.", icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        toast.promise(deleteQuote(tenantId, id), {
          loading: 'Eliminando...', success: '¡Presupuesto eliminado!', error: 'Error.'
        });
      }
    });
  };
  
  const handlePrintQuote = (quote) => {
    if (!businessData) {
      toast.error("Datos del negocio no están cargados. Intente de nuevo.");
      return;
    }
    generateQuotePDF(businessData, quote);
  };

  // --- FUNCIÓN 'handleConvertToSale' IMPLEMENTADA ---
  const handleConvertToSale = (quote) => {
    const cartToConvert = {
      items: quote.items,
      client: quote.client,
    };
    sessionStorage.setItem('quoteToConvert', JSON.stringify(cartToConvert));
    navigate('/ventas');
  };

  const handleViewQuote = (quote) => {
    setSelectedQuote(quote);
    setIsDetailsModalOpen(true);
  };
  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedQuote(null);
  };

  const pageCount = Math.ceil(quotes.length / pageSize);
  const currentQuotes = quotes.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  return (
    <div className="quotes-page">
      <header className="page-header">
        <h1>Historial de Presupuestos</h1>
        <Button onClick={() => handleOpenEditorModal()}>
          <FiPlus /> Crear Presupuesto
        </Button>
      </header>
      
      <div className="filters-container-reports">
        <div className="date-filter">
            <label htmlFor="start-date">Desde:</label>
            <input type="date" id="start-date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <label htmlFor="end-date">Hasta:</label>
            <input type="date" id="end-date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            <Button onClick={handleApplyFilter} type="primary" disabled={!startDate || !endDate}>Aplicar</Button>
        </div>
        <button className="clear-filter-btn" onClick={handleClearFilter}>Mostrar Hoy</button>
      </div>

      {isLoading ? (
        <p>Cargando presupuestos...</p>
      ) : (
        <>
          <QuoteTable
            quotes={currentQuotes}
            onView={handleViewQuote}
            onPrint={handlePrintQuote}
            onConvertToSale={handleConvertToSale}
            onEdit={handleOpenEditorModal}
            onDelete={handleDeleteQuote}
          />

          {pageCount > 1 && (
            <div className="pagination-container">
              <ReactPaginate
                previousLabel={'< Anterior'} nextLabel={'Siguiente >'} breakLabel={'...'}
                pageCount={pageCount} marginPagesDisplayed={2} pageRangeDisplayed={3}
                onPageChange={handlePageClick} containerClassName={'pagination'} activeClassName={'active'}
                forcePage={currentPage}
              />
            </div>
          )}
        </>
      )}

      {isEditorModalOpen && (
        <QuoteEditorModal
          isOpen={isEditorModalOpen}
          onClose={handleCloseEditorModal}
          products={products}
          combos={combos}
          clients={clients}
          onSubmit={handleFormSubmit}
          initialData={quoteToEdit}
        />
      )}

      {isDetailsModalOpen && (
        <QuoteDetailsModal 
          quote={selectedQuote} 
          onClose={handleCloseDetailsModal} 
        />
      )}
    </div>
  );
};

export default PresupuestosPage;