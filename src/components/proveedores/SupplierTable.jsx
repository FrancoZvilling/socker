// src/components/proveedores/SupplierTable.jsx
import React from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
// Podemos reutilizar los estilos de la tabla de productos
import '../../components/inventario/ProductTable.css'; 

const SupplierTable = ({ suppliers, onEdit, onDelete }) => {
  if (suppliers.length === 0) {
    return <p>No hay proveedores registrados. ¡Añade el primero!</p>;
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Nombre / Razón Social</th>
            <th>CUIT / RUT</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map(supplier => (
            <tr key={supplier.id}>
              <td>{supplier.name}</td>
              <td>{supplier.taxId || 'N/A'}</td>
              <td>{supplier.phone || 'N/A'}</td>
              <td>{supplier.email || 'N/A'}</td>
              <td className="actions-cell">
                <button className="icon-button" onClick={() => onEdit(supplier)}><FiEdit /></button>
                <button className="icon-button danger" onClick={() => onDelete(supplier.id)}><FiTrash2 /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SupplierTable;