// src/components/presupuestos/QuoteTable.jsx
import React from 'react';
import { FiEye, FiPrinter, FiArrowRightCircle, FiEdit, FiTrash2 } from 'react-icons/fi';
import { formatCurrency } from '../../utils/formatters';
import '../../components/inventario/ProductTable.css';

// No hay cambios en los props, ya que la página principal seguirá pasando 'onPrint'
const QuoteTable = ({ quotes, onView, onPrint, onConvertToSale, onEdit, onDelete }) => {
  if (quotes.length === 0) {
    return <p>No se encontraron presupuestos para el período seleccionado.</p>;
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'sent': return 'status-pending';
      case 'accepted': return 'status-paid';
      case 'expired': return 'status-returned';
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
                <button className="icon-button" onClick={() => onView(quote)} title="Ver Detalles"><FiEye /></button>
                {/* El botón de imprimir ahora es un botón simple que llama a la función 'onPrint' */}
                <button className="icon-button" onClick={() => onPrint(quote)} title="Imprimir PDF"><FiPrinter /></button>
                <button className="icon-button" onClick={() => onConvertToSale(quote)} title="Convertir en Venta"><FiArrowRightCircle /></button>
                <button className="icon-button" onClick={() => onEdit(quote)} title="Editar"><FiEdit /></button>
                <button className="icon-button danger" onClick={() => onDelete(quote.id)} title="Eliminar"><FiTrash2 /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QuoteTable;