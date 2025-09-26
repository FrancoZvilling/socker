// src/components/caja/SessionHistoryTable.jsx
import React from 'react';
import { formatCurrency } from '../../utils/formatters';
import '../../components/inventario/ProductTable.css'; // Reutilizamos estilos

const SessionHistoryTable = ({ sessions }) => {
  if (sessions.length === 0) {
    return <p>No se encontraron sesiones de caja cerradas para el período seleccionado.</p>;
  }

  const formatDate = (timestamp) => {
    return timestamp ? timestamp.toDate().toLocaleString() : 'N/A';
  };

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Apertura</th>
            <th>Cierre</th>
            <th>Monto Inicial</th>
            <th>Monto Esperado</th>
            <th>Monto Final (Contado)</th>
            <th>Diferencia</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map(session => (
            <tr key={session.id}>
              <td>{formatDate(session.openedAt)}</td>
              <td>{formatDate(session.closedAt)}</td>
              <td>{formatCurrency(session.openingAmount)}</td>
              <td>{formatCurrency(session.expectedInCash)}</td>
              <td>{formatCurrency(session.closingAmount)}</td>
              <td className={session.difference > 0 ? 'income' : session.difference < 0 ? 'expense' : ''}>
                {formatCurrency(session.difference)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SessionHistoryTable;