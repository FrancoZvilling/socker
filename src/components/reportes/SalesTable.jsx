// src/components/reportes/SalesTable.jsx
import React from 'react';
import { FiEye } from 'react-icons/fi';
import { formatCurrency } from '../../utils/formatters';
import './SalesTable.css';

const SalesTable = ({ sales, onShowDetails }) => {
  if (sales.length === 0) {
    return <p>Aún no se han registrado ventas.</p>;
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Fecha y Hora</th>
            <th>Total</th>
            <th>Nº de Productos</th>
            <th>Detalles</th>
          </tr>
        </thead>
        <tbody>
          {sales.map(sale => (
            <tr key={sale.id}>
              <td>
                {/* El campo 'createdAt' de Firebase es un Timestamp, hay que convertirlo */}
                {sale.createdAt ? sale.createdAt.toDate().toLocaleString() : 'Fecha no disponible'}
              </td>
              <td>{formatCurrency(sale.total)}</td>
              <td>{sale.items.length}</td>
              <td>
                <button className="icon-button" title="Ver detalles de la venta" onClick={() => onShowDetails(sale)}>
                  <FiEye />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalesTable;