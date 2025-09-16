// src/components/reportes/SalesTable.jsx

import React from 'react';
// Se cambia el ícono de devolución por uno más representativo como FiRotateCcw
import { FiEye, FiPrinter, FiRotateCcw } from 'react-icons/fi';
import { formatCurrency } from '../../utils/formatters';
import './SalesTable.css';

const SalesTable = ({ sales, onShowDetails, onPrint, onReturn }) => {
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
                  onClick={() => onPrint(sale)}
                >
                  <FiPrinter />
                </button>
                
                {/* --- Lógica Condicional Implementada --- */}
                {/* Si la venta tiene el estado 'completed', muestra una etiqueta. */}
                {sale.returnStatus === 'completed' ? (
                  <span className="status-returned" title="Esta venta ya tiene una devolución registrada">
                    Devuelto
                  </span>
                ) : (
                  // Si no, muestra el botón para iniciar la devolución.
                  <button 
                    className="icon-button" 
                    title="Registrar Devolución" 
                    onClick={() => onReturn(sale)}
                  >
                    <FiRotateCcw />
                  </button>
                )}
                {/* ------------------------------------ */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalesTable;