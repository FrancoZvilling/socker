// src/components/presupuestos/QuoteEditorModal.jsx
import React, { useState, useMemo } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import ReactPaginate from 'react-paginate'; // Se importa ReactPaginate
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../../utils/formatters';
import ProductGrid from '../ventas/ProductGrid';
import ClientSelectionModal from '../clientes/ClientSelectionModal';
import { FiUserPlus, FiTrash2 } from 'react-icons/fi';
import './QuoteEditorModal.css';
import '../../pages/InventarioPage.css'; // Se importa para los estilos de paginación

// Pequeño sub-componente para el carrito interno (sin cambios)
const QuoteCart = ({ cartItems, onUpdateQuantity, onRemoveItem }) => {
  return (
    <div className="quote-cart-items">
      {cartItems.length === 0 ? (
        <p className="empty-cart-message">Añade productos del catálogo...</p>
      ) : (
        cartItems.map(item => (
          <div key={item.key} className="quote-cart-item">
            <span className="item-name">{item.name}</span>
            <input 
              type="number"
              value={item.quantity}
              onChange={(e) => onUpdateQuantity(item.key, parseInt(e.target.value))}
              min="1"
            />
            <span className="item-subtotal">{formatCurrency(item.price * item.quantity)}</span>
            <button onClick={() => onRemoveItem(item.key)}><FiTrash2 /></button>
          </div>
        ))
      )}
    </div>
  );
};

// Se añade 'initialData' a los props para la funcionalidad de edición
const QuoteEditorModal = ({ isOpen, onClose, products, combos, clients, onSubmit, initialData }) => {
  // Se inicializan los estados con los datos existentes si se está editando
  const [cart, setCart] = useState(initialData?.items || []);
  const [selectedClient, setSelectedClient] = useState(initialData?.client || null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  // Lógica de catálogo (sin cambios)
  const catalogItems = useMemo(() => {
    const formattedProducts = products.map(p => ({ ...p, type: 'product', key: `product-${p.id}` }));
    const formattedCombos = combos.map(c => ({ ...c, type: 'combo', key: `combo-${c.id}` }));
    return [...formattedProducts, ...formattedCombos];
  }, [products, combos]);

  const filteredCatalog = useMemo(() => {
    if (!searchTerm.trim()) return catalogItems;
    const term = searchTerm.toLowerCase();
    return catalogItems.filter(item => item.name.toLowerCase().includes(term));
  }, [catalogItems, searchTerm]);
  
  // Lógica para paginar el catálogo
  const pageCount = Math.ceil(filteredCatalog.length / pageSize);
  const offset = currentPage * pageSize;
  const currentCatalogItems = filteredCatalog.slice(offset, offset + pageSize);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  // Handlers del carrito (sin cambios)
  const handleAddToCart = (item) => {
    const existing = cart.find(i => i.key === item.key);
    if (existing) {
      setCart(cart.map(i => i.key === item.key ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };
  const handleUpdateQuantity = (key, quantity) => {
    const numQuantity = Math.max(1, parseInt(quantity) || 1);
    setCart(cart.map(i => i.key === key ? { ...i, quantity: numQuantity } : i));
  };
  const handleRemoveItem = (key) => setCart(cart.filter(i => i.key !== key));
  const totalPrice = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  const handleSubmit = () => {
    if (cart.length === 0) {
      toast.error("El presupuesto no puede estar vacío.");
      return;
    }
    const quoteData = {
      client: selectedClient ? { id: selectedClient.id, name: selectedClient.name } : null,
      items: cart,
      total: totalPrice,
      status: initialData?.status || 'draft', // Mantiene el estado si se edita
    };
    onSubmit(quoteData);
    // onClose(); // Se elimina onClose para que lo maneje la página principal
  };

  return (
    <>
      <div className="quote-editor-modal-wrapper">
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Editar Presupuesto" : "Crear Nuevo Presupuesto"}>
          <div className="quote-editor-layout">
            <div className="quote-catalog-column">
              <input
                type="text"
                placeholder="Buscar producto o combo..."
                className="search-input-pos"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <ProductGrid products={currentCatalogItems} onAddToCart={handleAddToCart} />
              {pageCount > 1 && (
                <div className="pagination-container modal-pagination">
                  <ReactPaginate
                    previousLabel={'<'} nextLabel={'>'} breakLabel={'...'}
                    pageCount={pageCount} marginPagesDisplayed={1} pageRangeDisplayed={2}
                    onPageChange={handlePageClick} containerClassName={'pagination'}
                    activeClassName={'active'} forcePage={currentPage}
                  />
                </div>
              )}
            </div>
            <div className="quote-cart-column">
              <div className="client-selector">
                {selectedClient ? (
                  <div className="client-selected">
                    <span>CLIENTE: <strong>{selectedClient.name}</strong></span>
                    <button onClick={() => setSelectedClient(null)}>Quitar</button>
                  </div>
                ) : (
                  <button className="select-client-btn" onClick={() => setIsClientModalOpen(true)}>
                    <FiUserPlus /> <span>Asociar Cliente</span>
                  </button>
                )}
              </div>
              <QuoteCart
                cartItems={cart}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
              />
              <div className="cart-footer">
                <div className="total-section">
                  <span>TOTAL</span>
                  <span className="total-amount">{formatCurrency(totalPrice)}</span>
                </div>
                <Button type="primary" onClick={handleSubmit} disabled={cart.length === 0}>
                  {initialData ? 'Guardar Cambios' : 'Guardar Presupuesto'}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
      {isClientModalOpen && (
        <ClientSelectionModal
          isOpen={isClientModalOpen}
          onClose={() => setIsClientModalOpen(false)}
          clients={clients}
          onSelectClient={(client) => setSelectedClient(client)}
        />
      )}
    </>
  );
};

export default QuoteEditorModal;