// src/pages/VentasPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProductsRealtime } from '../services/productService';
import { getClientsRealtime } from '../services/clientService';
import { processSale } from '../services/saleService';
import ProductGrid from '../components/ventas/ProductGrid';
import Cart from '../components/ventas/Cart';
import ClientSelectionModal from '../components/clientes/ClientSelectionModal';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { FiUserPlus } from 'react-icons/fi';
import './VentasPage.css';

const VentasPage = () => {
  const { userData } = useAuth(); // <-- CAMBIO
  const tenantId = userData?.tenantId;

  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [posSearchTerm, setPosSearchTerm] = useState('');

  useEffect(() => {
    if (!tenantId) return; // No hacer nada si el tenantId no está listo

    // <-- CAMBIO: Se pasa el tenantId a las llamadas de servicio
    const unsubscribeProducts = getProductsRealtime(tenantId, (fetchedProducts) => {
      setProducts(fetchedProducts);
      setIsLoading(false);
    });
    const unsubscribeClients = getClientsRealtime(tenantId, setClients);
    
    return () => {
      unsubscribeProducts();
      unsubscribeClients();
    };
  }, [tenantId]); // <-- CAMBIO: El efecto ahora depende del tenantId

  const handleAddToCart = (productToAdd) => {
    const existingItem = cart.find(item => item.id === productToAdd.id);
    if (existingItem && existingItem.quantity >= productToAdd.stock) {
      toast.error('No hay más stock disponible para este producto.');
      return;
    }
    if (!existingItem && productToAdd.stock <= 0) {
      toast.error('Este producto no tiene stock disponible.');
      return;
    }
    if (existingItem) {
      setCart(currentCart => currentCart.map(item =>
        item.id === productToAdd.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart(currentCart => [...currentCart, { ...productToAdd, quantity: 1 }]);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!posSearchTerm.trim()) return products;
    const searchTermLower = posSearchTerm.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTermLower) ||
      (product.sku && product.sku.toLowerCase().includes(searchTermLower))
    );
  }, [products, posSearchTerm]);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredProducts.length === 1) {
        handleAddToCart(filteredProducts[0]);
        setPosSearchTerm('');
      } else if (filteredProducts.length > 1) {
        toast('Hay múltiples coincidencias. Por favor, refine la búsqueda.');
      }
    }
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    const product = products.find(p => p.id === productId);
    if (newQuantity > product.stock) {
      toast.error('No hay más stock disponible.'); return;
    }
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.id !== productId));
    } else {
      setCart(cart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const totalPrice = useMemo(() => cart.reduce((total, item) => total + item.price * item.quantity, 0), [cart]);

  const handleClearCart = () => {
    setCart([]);
    setSelectedClient(null);
  };
  
  const handleCheckout = () => {
    const saleData = {
      items: cart,
      total: totalPrice,
      client: selectedClient ? { id: selectedClient.id, name: selectedClient.name } : null,
    };
    Swal.fire({
      title: 'Confirmar Venta',
      text: `El total a cobrar es: ${totalPrice.toFixed(2)}. ¿Continuar?`,
      icon: 'question', showCancelButton: true, confirmButtonColor: '#38a169',
      cancelButtonColor: '#d33', confirmButtonText: 'Sí, cobrar', cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // <-- CAMBIO: Se pasa el tenantId a processSale
        const promise = processSale(tenantId, saleData, false);
        toast.promise(promise, {
          loading: 'Procesando venta...',
          success: <b>¡Venta completada!</b>,
          error: <b>Error al procesar la venta.</b>,
        });
        promise.then(() => handleClearCart());
      }
    });
  };

  const handleCreditSale = () => {
    const saleData = {
      items: cart,
      total: totalPrice,
      client: selectedClient ? { id: selectedClient.id, name: selectedClient.name } : null,
    };
    Swal.fire({
      title: 'Confirmar Venta a Crédito',
      text: `Se añadirá un saldo de ${totalPrice.toFixed(2)} a la cuenta de ${selectedClient.name}. ¿Continuar?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#38a169',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // <-- CAMBIO: Se pasa el tenantId a processSale
        const promise = processSale(tenantId, saleData, true);
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
          placeholder="Buscar producto por nombre o escanear código..."
          className="search-input-pos"
          value={posSearchTerm}
          onChange={(e) => setPosSearchTerm(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          autoFocus
        />
        {isLoading ? (
          <p>Cargando catálogo...</p>
        ) : (
          <ProductGrid products={filteredProducts} onAddToCart={handleAddToCart} />
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
    </div>
  );
};

export default VentasPage;