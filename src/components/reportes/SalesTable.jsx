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
            <th>Total Venta</th>
            <th>Costo Total</th> {/* <-- Columna añadida */}
            <th>Ganancia</th>    {/* <-- Columna añadida */}
            <th>Detalles</th>
          </tr>
        </thead>
        <tbody>
          {sales.map(sale => (
            <tr key={sale.id}>
              <td>
                {sale.createdAt ? sale.createdAt.toDate().toLocaleString() : 'Fecha no disponible'}
              </td>
              <td>{formatCurrency(sale.total)}</td>
              {/* Se muestran los nuevos datos. Se usa '|| 0' como respaldo para ventas antiguas que no tengan el campo. */}
              <td>{formatCurrency(sale.totalCost || 0)}</td>
              <td className="profit-cell">{formatCurrency(sale.profit || 0)}</td>
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