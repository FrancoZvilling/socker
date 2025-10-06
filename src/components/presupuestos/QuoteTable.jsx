// src/components/presupuestos/QuoteTable.jsx
import React from 'react';
import { FiEye, FiPrinter, FiArrowRightCircle, FiEdit, FiTrash2 } from 'react-icons/fi';
import { formatCurrency } from '../../utils/formatters';
import '../../components/inventario/ProductTable.css'; // Reutilizamos estilos

const QuoteTable = ({ quotes, onView, onPrint, onConvertToSale, onEdit, onDelete }) => {
  if (quotes.length === 0) {
    return <p>No se encontraron presupuestos para el período seleccionado.</p>;
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'sent': return 'status-pending';
      case 'accepted': return 'status-paid'; // Reutilizamos el estilo verde
      case 'expired': return 'status-returned'; // Reutilizamos el estilo gris
      default: return '';
    }
  };

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Nº Presupuesto</th>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {quotes.map(quote => (
            <tr key={quote.id}>
              <td>{quote.quoteNumber || quote.id.slice(0, 6).toUpperCase()}</td>
              <td>{quote.client?.name || 'Consumidor Final'}</td>
              <td>{quote.createdAt ? quote.createdAt.toDate().toLocaleDateString() : 'N/A'}</td>
              <td>{formatCurrency(quote.total || 0)}</td>
              <td>
                <span className={`status-badge ${getStatusClass(quote.status)}`}>
                  {quote.status || 'Borrador'}
                </span>
              </td>
              <td className="actions-cell">
                <button onClick={() => onView(quote)} title="Ver Detalles"><FiEye /></button>
                <button onClick={() => onPrint(quote)} title="Imprimir PDF"><FiPrinter /></button>
                <button onClick={() => onConvertToSale(quote)} title="Convertir en Venta"><FiArrowRightCircle /></button>
                <button onClick={() => onEdit(quote)} title="Editar"><FiEdit /></button>
                <button className="danger" onClick={() => onDelete(quote.id)} title="Eliminar"><FiTrash2 /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QuoteTable;