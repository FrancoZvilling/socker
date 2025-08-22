// src/components/ventas/ProductGridItem.jsx
import React from 'react';
import './ProductGridItem.css';
import { formatCurrency } from '../../utils/formatters';

const ProductGridItem = ({ product, onAddToCart }) => {
  return (
    <button className="product-card" onClick={() => onAddToCart(product)}>
      {/* Más adelante aquí podríamos poner una imagen del producto */}
      <div className="product-card-name">{product.name}</div>
      <div className="product-card-price">{formatCurrency(product.price)}</div>
    </button>
  );
};

export default ProductGridItem;