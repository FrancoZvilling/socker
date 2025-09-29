// src/components/ventas/ProductGridItem.jsx
import React from 'react';
import { formatCurrency } from '../../utils/formatters'; // Se importa el formateador
import './ProductGridItem.css';

const ProductGridItem = ({ product, onAddToCart }) => {
  // --- LÓGICA DE ESTADO DE STOCK ---
  let nameClassName = 'product-card-name';
  let cardClassName = 'product-card';
  let isDisabled = false;

  // Solo aplicamos esta lógica si es un producto, no un combo
  if (product.type === 'product') {
    const stock = product.stock || 0;
    const minStock = product.minStock || 0;

    if (stock <= 0) {
      nameClassName += ' status-out';
      cardClassName += ' disabled';
      isDisabled = true;
    } else if (stock <= minStock) {
      nameClassName += ' status-low';
    }
  }
  // ------------------------------------

  return (
    <button
      className={cardClassName}
      onClick={() => onAddToCart(product)}
      disabled={isDisabled} // Se deshabilita el botón si no hay stock
      title={isDisabled ? "Producto sin stock" : ""}
    >
      <div className={nameClassName}>{product.name}</div>
      <div className="product-card-price">{formatCurrency(product.price)}</div>
    </button>
  );
};

export default ProductGridItem;