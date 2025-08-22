// src/components/ventas/ProductGrid.jsx
import React from 'react';
import ProductGridItem from './ProductGridItem';
import './ProductGrid.css';

const ProductGrid = ({ products, onAddToCart }) => {
  return (
    <div className="product-grid">
      {products.map(product => (
        <ProductGridItem key={product.id} product={product} onAddToCart={onAddToCart} />
      ))}
    </div>
  );
};

export default ProductGrid;