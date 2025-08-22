// src/components/ventas/Cart.jsx
import React, { useMemo } from 'react';
import Button from '../common/Button';
import CartItem from './CartItem'; // <-- 1. Importamos el nuevo componente
import { formatCurrency } from '../../utils/formatters';
import './Cart.css';

// --- 2. Recibimos los props ---
const Cart = ({ cartItems, onUpdateQuantity, onRemoveItem, onCheckout, onCreditSale, selectedClient }) => {

  // --- 3. Calculamos el total usando useMemo para eficiencia ---
  const totalPrice = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cartItems]);

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h3>Resumen de Venta</h3>
      </div>
      <div className="cart-items">
        {/* --- 4. Lógica de renderizado dinámico --- */}
        {cartItems.length === 0 ? (
          <p className="empty-cart-message">El carrito está vacío</p>
        ) : (
          cartItems.map(item => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={onUpdateQuantity}
              onRemoveItem={onRemoveItem}
            />
          ))
        )}
      </div>
      <div className="cart-footer">
        <div className="total-section">
          <span>TOTAL</span>
          <span className="total-amount">{formatCurrency(totalPrice)}</span>
        </div>
        <div className="cart-actions">
          <Button
            type="secondary" // Usamos un estilo secundario para diferenciarlo
            onClick={onCreditSale}
            // El botón se habilita solo si hay items Y un cliente seleccionado
            disabled={cartItems.length === 0 || !selectedClient}
            title={!selectedClient ? "Seleccione un cliente para vender a crédito" : ""}
          >
            Vender a Crédito
          </Button>
        <Button
          type="primary"
          disabled={cartItems.length === 0}
          onClick={onCheckout}
        >
          Cobrar
        </Button>
        </div>
      </div>
    </div>
  );
};

export default Cart;