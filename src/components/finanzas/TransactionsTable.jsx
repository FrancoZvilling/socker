// src/components/finanzas/TransactionsTable.jsx
import React from 'react';
import { FiEdit, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import { formatCurrency } from '../../utils/formatters';
import '../../components/inventario/ProductTable.css'; // Reutilizamos estilos

const TransactionsTable = ({ transactions, onEdit, onDelete, onMarkAsCompleted }) => {
  if (transactions.length === 0) {
    return <p>No hay transacciones pendientes en esta categoría.</p>;
  }
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Descripción</th>
            <th>Monto</th>
            <th>Fecha Vencimiento</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(tx => (
            <tr key={tx.id}>
              <td>{tx.description}</td>
              <td>{formatCurrency(tx.amount)}</td>
              <td>{tx.dueDate.toDate().toLocaleDateString()}</td>
              <td className="actions-cell">
                <button 
                  className="icon-button" 
                  title="Marcar como Completado"
                  onClick={() => onMarkAsCompleted(tx.id)}
                >
                  <FiCheckCircle />
                </button>
                <button className="icon-button" onClick={() => onEdit(tx)}><FiEdit /></button>
                <button className="icon-button danger" onClick={() => onDelete(tx.id)}><FiTrash2 /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default TransactionsTable;