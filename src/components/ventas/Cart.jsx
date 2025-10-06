// src/components/ventas/Cart.jsx
import React, { useMemo } from 'react';
import Button from '../common/Button';
import CartItem from './CartItem';
import { formatCurrency } from '../../utils/formatters';
import './Cart.css';

const Cart = ({ cartItems, onUpdateQuantity, onRemoveItem, onCheckout, onCreditSale, selectedClient }) => {
  const totalPrice = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cartItems]);

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h3>Resumen de Venta</h3>
      </div>
      <div className="cart-items">
        {cartItems.length === 0 ? (
          <p className="empty-cart-message">El carrito está vacío</p>
        ) : (
          cartItems.map(item => (
            <CartItem
              key={item.key} // Se usa la 'key' única en lugar de 'id'
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
            type="secondary"
            onClick={onCreditSale}
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