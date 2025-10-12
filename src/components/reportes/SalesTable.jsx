// src/components/reportes/SalesTable.jsx

import React from 'react';
import { FiEye, FiPrinter, FiRotateCcw, FiTruck } from 'react-icons/fi';
import { formatCurrency } from '../../utils/formatters';
import './SalesTable.css';

// Función de ayuda para traducir los métodos de pago a un formato legible
const formatPaymentMethod = (method) => {
  switch (method) {
    case 'cash': return 'Efectivo';
    case 'card': return 'Tarjeta';
    case 'transfer': return 'Transferencia';
    case 'cheque': return 'Cheque';
    case 'credit': return 'A Crédito';
    default: return method || 'N/A'; // Muestra el método si no es conocido, o N/A
  }
};

const SalesTable = ({ sales, onShowDetails, onPrintTicket, onPrintDeliveryNote, onReturn }) => {
  if (sales.length === 0) {
    return <p>Aún no se han registrado ventas para el período seleccionado.</p>;
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Fecha y Hora</th>
            <th>Cliente</th>
            <th>Método de Pago</th>
            <th>Total Venta</th>
            <th>Costo Total</th>
            <th>Ganancia</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {sales.map(sale => (
            <tr key={sale.id}>
              <td>
                {sale.createdAt ? sale.createdAt.toDate().toLocaleString() : 'Fecha no disponible'}
              </td>
              <td>{sale.client?.name || 'S/N'}</td>
              
              {/* Se añade la nueva celda con el método de pago formateado */}
              <td>{formatPaymentMethod(sale.paymentMethod)}</td>

              <td>{formatCurrency(sale.total)}</td>
              <td>{formatCurrency(sale.totalCost || 0)}</td>
              <td className="profit-cell">{formatCurrency(sale.profit || 0)}</td>
              <td className="actions-cell">
                <button
                  className="icon-button"
                  title="Ver detalles de la venta"
                  onClick={() => onShowDetails(sale)}
                >
                  <FiEye />
                </button>
                <button
                  className="icon-button"
                  title="Imprimir Ticket"
                  onClick={() => onPrintTicket(sale)}
                >
                  <FiPrinter />
                </button>
                <button
                  className="icon-button"
                  title="Imprimir Remito"
                  onClick={() => onPrintDeliveryNote(sale)}
                >
                  <FiTruck />
                </button>
                {sale.returnStatus === 'completed' ? (
                  <span className="status-returned" title="Esta venta ya tiene una devolución registrada">
                    Devuelto
                  </span>
                ) : (
                  <button
                    className="icon-button"
                    title="Registrar Devolución"
                    onClick={() => onReturn(sale)}
                  >
                    <FiRotateCcw />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalesTable;