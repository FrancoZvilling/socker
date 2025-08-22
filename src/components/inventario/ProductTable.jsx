// src/components/inventario/ProductTable.jsx
import React from 'react';
// 1. Importamos el ícono de alerta
import { FiEdit, FiTrash2, FiAlertTriangle, FiClock } from 'react-icons/fi';
import { formatCurrency } from '../../utils/formatters';
import './ProductTable.css';

// 2. Hacemos el componente StockBadge más inteligente
const StockBadge = ({ stock, minStock }) => {
  // Definimos minStock como 0 si no está establecido para evitar errores
  const effectiveMinStock = minStock || 0;

  // Condición de stock bajo: si el stock es mayor a 0 PERO menor o igual al mínimo
  const isLowStock = stock > 0 && stock <= effectiveMinStock;
  // Condición de sin stock
  const isOutOfStock = stock <= 0;

  // Asignamos una clase CSS basada en el estado del stock
  let className = 'stock-badge ';
  if (isOutOfStock) {
    className += 'out-of-stock';
  } else if (isLowStock) {
    className += 'low-stock';
  } else {
    className += 'in-stock';
  }

  return (
    <span className={className}>
      {/* Mostramos un ícono de alerta solo si el stock es bajo */}
      {isLowStock && <FiAlertTriangle className="alert-icon" />}
      {stock} Unidades
    </span>
  );
};

// El componente principal de la tabla
const ProductTable = ({ products, onEditProduct, onDeleteProduct, onShowHistory }) => {
  // Mensaje si no hay productos (sin cambios)
  if (products.length === 0) {
    return <p>No hay productos en el inventario. ¡Agrega el primero!</p>;
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>SKU / Código</th>
            <th>Categoría</th>
            <th>Proveedor</th>
            <th>Stock</th>
            <th>Precio Venta</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            // 3. Lógica para determinar si la fila entera debe ser destacada
            const isStockLow = product.stock > 0 && product.stock <= (product.minStock || 0);
            const isStockOut = product.stock <= 0;

            return (
              <tr
                key={product.id}
                // Añadimos una clase CSS condicional a la etiqueta <tr> de la fila
                className={isStockOut ? 'row-out-of-stock' : isStockLow ? 'row-low-stock' : ''}
              >
                <td>{product.name}</td>
                
                <td>{product.sku}</td>
                <td>{product.category}</td>
                <td>{product.supplierName || 'N/A'}</td>
                <td>
                  {/* Pasamos tanto el stock actual como el mínimo al componente Badge */}
                  <StockBadge stock={product.stock} minStock={product.minStock} />
                </td>
                <td>{formatCurrency(product.price)}</td>
                <td className="actions-cell">
                  <button
                    className="icon-button"
                    onClick={() => onShowHistory(product)}
                    title="Ver Historial" // 'title' añade un texto de ayuda al pasar el mouse
                  >
                    <FiClock />
                  </button>
                  <button
                    className="icon-button"
                    onClick={() => onEditProduct(product)}
                  >
                    <FiEdit />
                  </button>
                  <button
                    className="icon-button danger"
                    onClick={() => onDeleteProduct(product.id)}
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;