// src/components/presupuestos/QuoteDetailsModal.jsx
import React from 'react';
import Modal from '../common/Modal';
import { formatCurrency } from '../../utils/formatters';
// Reutilizamos los estilos del modal de detalles de venta para consistencia
import '../../components/reportes/SaleDetailsModal.css';

const QuoteDetailsModal = ({ quote, onClose }) => {
  if (!quote) return null;

  return (
    <Modal isOpen={true} onClose={onClose} title="Detalles del Presupuesto">
      <div className="sale-details-content">
        <div className="sale-meta">
          <span>
            <strong>Fecha de Creación:</strong> {quote.createdAt.toDate().toLocaleString()}
          </span>
          <span>
            <strong>Presupuesto Nº:</strong> {quote.id.slice(0, 8).toUpperCase()}
          </span>
        </div>
        
        {quote.client && (
          <div className="sale-meta" style={{ marginTop: '10px' }}>
            <span><strong>Cliente:</strong> {quote.client.name}</span>
          </div>
        )}

        <table className="details-table">
          <thead>
            <tr>
              <th>Producto / Combo</th>
              <th>Cantidad</th>
              <th>Precio Unit.</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {quote.items.map(item => (
              <tr key={item.key}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{formatCurrency(item.price)}</td>
                <td>{formatCurrency(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="sale-total-footer">
          {/* Dejamos un espacio en blanco a la izquierda para alinear con el de ventas */}
          <div></div>
          <div>
            <span>TOTAL PRESUPUESTO</span>
            <span>{formatCurrency(quote.total)}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default QuoteDetailsModal;