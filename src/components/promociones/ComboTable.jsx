// src/components/promociones/ComboTable.jsx
import React from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { formatCurrency } from '../../utils/formatters';
import '../../components/inventario/ProductTable.css'; // Reutilizamos estilos

const ComboTable = ({ combos, onEdit, onDelete }) => {
  if (combos.length === 0) {
    return <p>Aún no has creado ninguna promoción o combo.</p>;
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Nombre del Combo</th>
            <th>Precio de Venta</th>
            <th>Componentes</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {combos.map(combo => (
            <tr key={combo.id}>
              <td>{combo.name}</td>
              <td>{formatCurrency(combo.price)}</td>
              <td>
                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                  {combo.components.map(c => (
                    <li key={c.productId}>{c.quantity}x {c.productName}</li>
                  ))}
                </ul>
              </td>
              <td className="actions-cell">
                <button className="icon-button" onClick={() => onEdit(combo)}><FiEdit /></button>
                <button className="icon-button danger" onClick={() => onDelete(combo.id)}><FiTrash2 /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default ComboTable;