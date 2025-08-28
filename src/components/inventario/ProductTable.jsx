import React from 'react';
import { useAuth } from '../../context/AuthContext'; // Se importa el hook de autenticación
import { PERMISSIONS } from '../../config/permissions'; // Se importan los nombres de los permisos
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
  const { hasPermission } = useAuth(); // Se obtiene la función para verificar permisos

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
                <td>{formatCurrency(product.price)}</td>
                <td className="actions-cell">
                  {/* El botón de historial es visible para todos los roles con acceso al inventario */}
                  <button
                    className="icon-button"
                    onClick={() => onShowHistory(product)}
                    title="Ver Historial"
                  >
                    <FiClock />
                  </button>

                  {/* El botón de editar solo se renderiza si el usuario tiene el permiso */}
                  {hasPermission(PERMISSIONS.MANAGE_PRODUCTS) && (
                    <button
                      className="icon-button"
                      onClick={() => onEditProduct(product)}
                    >
                      <FiEdit />
                    </button>
                  )}

                  {/* El botón de eliminar solo se renderiza si el usuario tiene el permiso */}
                  {hasPermission(PERMISSIONS.MANAGE_PRODUCTS) && (
                    <button
                      className="icon-button danger"
                      onClick={() => onDeleteProduct(product.id)}
                    >
                      <FiTrash2 />
                    </button>
                  )}
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