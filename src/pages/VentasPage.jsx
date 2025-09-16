// src/pages/VentasPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProductsRealtime } from '../services/productService';
import { getClientsRealtime } from '../services/clientService';
import { getCombosRealtime } from '../services/comboService'; // Se importa el servicio de combos
import { processSale } from '../services/saleService';
import ProductGrid from '../components/ventas/ProductGrid';
import Cart from '../components/ventas/Cart';
import ClientSelectionModal from '../components/clientes/ClientSelectionModal';
import PaymentMethodModal from '../components/ventas/PaymentMethodModal';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { FiUserPlus } from 'react-icons/fi';
import { formatCurrency } from '../utils/formatters';
import './VentasPage.css';

const VentasPage = () => {
  const { userData, currentUser } = useAuth(); // Se añade currentUser por si se necesita
  const tenantId = userData?.tenantId;

  const [products, setProducts] = useState([]);
  const [combos, setCombos] = useState([]); // Nuevo estado para los combos
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [posSearchTerm, setPosSearchTerm] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    if (!tenantId) return;

    // Se suscribe a productos, combos y clientes
    const unsubscribeProducts = getProductsRealtime(tenantId, (fetchedProducts) => {
      setProducts(fetchedProducts);
      // La carga termina cuando los productos (el catálogo principal) están listos
      setIsLoading(false);
    });
    const unsubscribeCombos = getCombosRealtime(tenantId, setCombos);
    const unsubscribeClients = getClientsRealtime(tenantId, setClients);
    
    return () => {
      unsubscribeProducts();
      unsubscribeClients();
      unsubscribeCombos();
    };
  }, [tenantId]);
  
  // Se crea una lista unificada para el catálogo
  const catalogItems = useMemo(() => {
    // Se añade 'type' y una 'key' única para evitar colisiones
    const formattedProducts = products.map(p => ({ ...p, type: 'product', key: `product-${p.id}` }));
    const formattedCombos = combos.map(c => ({ ...c, type: 'combo', key: `combo-${c.id}` }));
    return [...formattedProducts, ...formattedCombos];
  }, [products, combos]);


  const filteredCatalog = useMemo(() => {
    if (!posSearchTerm.trim()) return catalogItems;
    const searchTermLower = posSearchTerm.toLowerCase();
    return catalogItems.filter(item =>
      item.name.toLowerCase().includes(searchTermLower) ||
      (item.sku && item.sku.toLowerCase().includes(searchTermLower))
    );
  }, [catalogItems, posSearchTerm]);

  const handleAddToCart = (itemToAdd) => {
    const existingItem = cart.find(item => item.key === itemToAdd.key);
    
    if (itemToAdd.type === 'product') {
      const stockAvailable = itemToAdd.stock || 0;
      if (stockAvailable <= 0 && !existingItem) {
        toast.error('Este producto no tiene stock disponible.'); return;
      }
      if (existingItem && existingItem.quantity >= stockAvailable) {
        toast.error('No hay más stock disponible.'); return;
      }
    }
    
    if (existingItem) {
      setCart(currentCart => currentCart.map(item =>
        item.key === itemToAdd.key ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart(currentCart => [...currentCart, { ...itemToAdd, quantity: 1 }]);
    }
  };
  
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCatalog.length === 1) {
        handleAddToCart(filteredCatalog[0]);
        setPosSearchTerm('');
      } else if (filteredCatalog.length > 1) {
        toast('Hay múltiples coincidencias. Por favor, refine la búsqueda.');
      }
    }
  };

  const handleUpdateQuantity = (itemKey, newQuantity) => {
    const itemInCart = cart.find(item => item.key === itemKey);
    if (!itemInCart) return;

    if (itemInCart.type === 'product') {
      if (newQuantity > itemInCart.stock) {
        toast.error('No hay más stock disponible.'); return;
      }
    }

    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.key !== itemKey));
    } else {
      setCart(cart.map(item =>
        item.key === itemKey ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const handleRemoveFromCart = (itemKey) => setCart(cart.filter(item => item.key !== itemKey));

  const totalPrice = useMemo(() => cart.reduce((total, item) => total + item.price * item.quantity, 0), [cart]);

  const handleClearCart = () => {
    setCart([]);
    setSelectedClient(null);
  };
  
  const handleCheckout = () => {
    setIsPaymentModalOpen(true);
  };

  const handleProcessSale = (paymentMethod) => {
    setIsPaymentModalOpen(false);
    const saleData = {
      items: cart,
      total: totalPrice,
      client: selectedClient ? { id: selectedClient.id, name: selectedClient.name } : null,
    };
    const promise = processSale(tenantId, saleData, false, paymentMethod);
    toast.promise(promise, {
      loading: 'Procesando venta...',
      success: <b>¡Venta completada!</b>,
      error: <b>Error al procesar la venta.</b>,
    });
    promise.then(() => handleClearCart());
  };

  const handleCreditSale = () => {
    const saleData = {
      items: cart,
      total: totalPrice,
      client: selectedClient ? { id: selectedClient.id, name: selectedClient.name } : null,
    };
    Swal.fire({
      title: 'Confirmar Venta a Crédito',
      text: `Se añadirá un saldo de ${formatCurrency(totalPrice)} a la cuenta de ${selectedClient.name}. ¿Continuar?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#38a169',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const promise = processSale(tenantId, saleData, true, 'credit');
        toast.promise(promise, {
          loading: 'Registrando venta a crédito...',
          success: <b>¡Venta a crédito registrada!</b>,
          error: <b>Error al registrar la venta.</b>,
        });
        promise.then(() => handleClearCart());
      }
    });
  };

  return (
    <div className="pos-page">
      <div className="catalog-column">
        <input
          type="text"
          placeholder="Buscar producto o combo..."
          className="search-input-pos"
          value={posSearchTerm}
          onChange={(e) => setPosSearchTerm(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          autoFocus
        />
        {isLoading ? (
          <p>Cargando catálogo...</p>
        ) : (
          <ProductGrid products={filteredCatalog} onAddToCart={handleAddToCart} />
        )}
      </div>
      
      <div className="cart-column">
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
        <Cart
          cartItems={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveFromCart}
          onCheckout={handleCheckout}
          onCreditSale={handleCreditSale}
          selectedClient={selectedClient}
        />
      </div>

      {isClientModalOpen && (
        <ClientSelectionModal
          isOpen={isClientModalOpen}
          onClose={() => setIsClientModalOpen(false)}
          clients={clients}
          onSelectClient={(client) => setSelectedClient(client)}
        />
      )}

      {isPaymentModalOpen && (
        <PaymentMethodModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onSelectMethod={handleProcessSale}
          totalAmount={formatCurrency(totalPrice)}
        />
      )}
    </div>
  );
};

export default VentasPage;