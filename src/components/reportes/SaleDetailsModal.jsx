// src/components/reportes/SaleDetailsModal.jsx
import React from 'react';
import Modal from '../common/Modal';
import { formatCurrency } from '../../utils/formatters';
import './SaleDetailsModal.css';

const SaleDetailsModal = ({ sale, onClose }) => {
  // Si no hay una venta seleccionada, no renderizamos nada.
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
              <th>Cantidad</th>
              <th>Precio Unit.</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{formatCurrency(item.price)}</td>
                <td>{formatCurrency(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="sale-total-footer">
          <span>TOTAL VENTA</span>
          <span>{formatCurrency(sale.total)}</span>
        </div>
      </div>
    </Modal>
  );
};

export default SaleDetailsModal;