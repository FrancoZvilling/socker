// src/components/clientes/ClientTable.jsx
import React from 'react';
import { FiEdit, FiTrash2, FiClock } from 'react-icons/fi';
import { formatCurrency } from '../../utils/formatters';
import '../../components/inventario/ProductTable.css'; // Reutilizamos estilos
import './ClientTable.css';

const ClientTable = ({ clients, onEdit, onDelete, onShowHistory }) => {
  if (clients.length === 0) {
    return <p>No hay clientes registrados. ¡Añade el primero!</p>;
  }
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Nombre y Apellido</th>
            <th>DNI / CUIT</th>
            <th>Teléfono</th>
            <th>Saldo Deudor</th>
            <th>Email</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(client => (
            <tr key={client.id}>
              <td>{client.name}</td>
              <td>{client.idNumber || 'N/A'}</td>
              <td>{client.phone || 'N/A'}</td>
              <td
                className={`
              ${client.balance > 0 ? 'debtor' : ''}
              ${client.balance < 0 ? 'credit' : ''}
            `}
              >
                {formatCurrency(client.balance || 0)}
              </td>
              <td>{client.email || 'N/A'}</td>

              <td className="actions-cell">
                <button
                  className="icon-button"
                  title="Ver historial de compras"
                  onClick={() => onShowHistory(client)}
                >
                  <FiClock />
                </button>
                <button className="icon-button" onClick={() => onEdit(client)}><FiEdit /></button>
                <button className="icon-button danger" onClick={() => onDelete(client.id)}><FiTrash2 /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default ClientTable;