// src/components/inventario/ProductTable.jsx

import React from 'react';
import { useAccess } from '../../context/AccessContext'; // Se importa el nuevo hook de acceso
// La importación de PERMISSIONS ya no es necesaria
import { FiEdit, FiTrash2, FiAlertTriangle, FiClock } from 'react-icons/fi';
import { formatCurrency } from '../../utils/formatters';
import './ProductTable.css';

const StockBadge = ({ stock, minStock }) => {
  const effectiveMinStock = minStock || 0;
  const isLowStock = stock > 0 && stock <= effectiveMinStock;
  const isOutOfStock = stock <= 0;
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
      {isLowStock && <FiAlertTriangle className="alert-icon" />}
      {stock} Unidades
    </span>
  );
};

const ProductTable = ({ products, onEditProduct, onDeleteProduct, onShowHistory }) => {
  // Se obtiene la nueva función 'hasAdminAccess' del contexto
  const { hasAdminAccess } = useAccess();

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
            
            {/* La cabecera "Precio Costo" solo se muestra en Modo Admin */}
            {hasAdminAccess() && (
              <th>Precio Costo</th>
            )}
            
            <th>Precio Venta</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const isStockLow = product.stock > 0 && product.stock <= (product.minStock || 0);
            const isStockOut = product.stock <= 0;

            return (
              <tr
                key={product.id}
                className={isStockOut ? 'row-out-of-stock' : isStockLow ? 'row-low-stock' : ''}
              >
                <td>{product.name}</td>
                <td>{product.sku}</td>
                <td>{product.category}</td>
                <td>{product.supplierName || 'N/A'}</td>
                <td>
                  <StockBadge stock={product.stock} minStock={product.minStock} />
                </td>
                
                {/* La celda de "Precio Costo" solo se muestra en Modo Admin */}
                {hasAdminAccess() && (
                  <td>{formatCurrency(product.costPrice || 0)}</td>
                )}
                
                <td>{formatCurrency(product.price)}</td>
                <td className="actions-cell">
                  <button
                    className="icon-button"
                    onClick={() => onShowHistory(product)}
                    title="Ver Historial"
                  >
                    <FiClock />
                  </button>

                  {/* Los botones de Editar y Borrar se muestran, pero se deshabilitan en Modo Empleado */}
                  <button
                    className="icon-button"
                    onClick={() => onEditProduct(product)}
                    title={hasAdminAccess() ? "Editar Producto" : "Se requiere modo Administrador"}
                    disabled={!hasAdminAccess()} // Se deshabilita el botón
                  >
                    <FiEdit />
                  </button>
                  <button
                    className="icon-button danger"
                    onClick={() => onDeleteProduct(product.id)}
                    title={hasAdminAccess() ? "Eliminar Producto" : "Se requiere modo Administrador"}
                    disabled={!hasAdminAccess()} // Se deshabilita el botón
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