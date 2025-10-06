// src/components/ventas/CartItem.jsx
import React from 'react';
import { FiPlus, FiMinus, FiX } from 'react-icons/fi';
import { formatCurrency } from '../../utils/formatters';
import './CartItem.css';

const CartItem = ({ item, onUpdateQuantity, onRemoveItem }) => {
  return (
    <div className="cart-item">
      <div className="item-info">
        <span className="item-name">{item.name}</span>
        <span className="item-price">{formatCurrency(item.price * item.quantity)}</span>
      </div>
      <div className="item-actions">
        <div className="quantity-control">
          {/* Se pasa 'item.key' en lugar de 'item.id' */}
          <button onClick={() => onUpdateQuantity(item.key, item.quantity - 1)}><FiMinus /></button>
          <span>{item.quantity}</span>
          <button onClick={() => onUpdateQuantity(item.key, item.quantity + 1)}><FiPlus /></button>
        </div>
        {/* Se pasa 'item.key' en lugar de 'item.id' */}
        <button className="remove-btn" onClick={() => onRemoveItem(item.key)}><FiX /></button>
      </div>
    </div>
  );
};

export default CartItem;