// src/components/reportes/SaleDetailsModal.jsx

import React from 'react';
import Modal from '../common/Modal';
import { formatCurrency } from '../../utils/formatters';
import './SaleDetailsModal.css';

const SaleDetailsModal = ({ sale, onClose }) => {
  if (!sale) {
    return null;
  }

  return (
    <Modal isOpen={true} onClose={onClose} title="Detalles de la Venta">
      <div className="sale-details-content">
        <div className="sale-meta">
          <span>
            <strong>Fecha:</strong> {sale.createdAt.toDate().toLocaleString()}
          </span>
          <span>
            <strong>ID de Venta:</strong> {sale.id}
          </span>
        </div>
        <table className="details-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cant.</th>
              <th>P. Venta Unit.</th> 
              <th>P. Costo Unit.</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{formatCurrency(item.price)}</td>
                <td>{formatCurrency(item.costPrice || 0)}</td>
                <td>{formatCurrency(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* --- Pie del modal actualizado --- */}
        <div className="sale-total-footer">
          <div className="costs-and-profit">
            <span>Costo Total: {formatCurrency(sale.totalCost || 0)}</span>
            <span className="profit-value">Ganancia: {formatCurrency(sale.profit || 0)}</span>
          </div>
          <div className="final-total">
            <span>TOTAL VENTA</span>
            <span>{formatCurrency(sale.total)}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SaleDetailsModal;