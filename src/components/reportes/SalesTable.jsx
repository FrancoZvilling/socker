// src/components/reportes/SalesTable.jsx
import React from 'react';
import { FiEye, FiPrinter } from 'react-icons/fi'; // Se añade el ícono de impresora
import { formatCurrency } from '../../utils/formatters';
import './SalesTable.css';

// Se añade el nuevo prop 'onPrint'
const SalesTable = ({ sales, onShowDetails, onPrint }) => {
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
              <td>{formatCurrency(sale.total)}</td>
              <td>{formatCurrency(sale.totalCost || 0)}</td>
              <td className="profit-cell">{formatCurrency(sale.profit || 0)}</td>
              {/* La celda ahora contiene dos botones */}
              <td className="actions-cell">
                <button 
                  className="icon-button" 
                  title="Ver detalles de la venta" 
                  onClick={() => onShowDetails(sale)}
                >
                  <FiEye />
                </button>
                {/* Se añade el nuevo botón para imprimir */}
                <button 
                  className="icon-button" 
                  title="Imprimir Ticket" 
                  onClick={() => onPrint(sale)}
                >
                  <FiPrinter />
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