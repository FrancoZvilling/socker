// src/components/reportes/SalesTable.jsx

import React from 'react';
// Se añade el ícono FiTruck para el remito
import { FiEye, FiPrinter, FiRotateCcw, FiTruck } from 'react-icons/fi'; 
import { formatCurrency } from '../../utils/formatters';
import './SalesTable.css';

// Se añade la nueva prop 'onPrintDeliveryNote'
const SalesTable = ({ sales, onShowDetails, onPrint, onReturn, onPrintDeliveryNote }) => {
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
                
                {/* --- SE AÑADE EL NUEVO BOTÓN PARA IMPRIMIR REMITO --- */}
                <button 
                  className="icon-button" 
                  title="Imprimir Remito" 
                  onClick={() => onPrintDeliveryNote(sale)}
                >
                  <FiTruck />
                </button>
                {/* -------------------------------------------------- */}

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