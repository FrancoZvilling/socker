// src/components/inventario/ProductHistoryModal.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Modal from '../common/Modal';
import { getProductMovements } from '../../services/productService';
import './ProductHistoryModal.css';

const ProductHistoryModal = ({ product, onClose }) => {
  const { userData } = useAuth(); // <-- CAMBIO
  const tenantId = userData?.tenantId;
  const [movements, setMovements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (product && tenantId) {
      const unsubscribe = getProductMovements(tenantId, product.id, (fetchedMovements) => {
        setMovements(fetchedMovements);
        setIsLoading(false);
      });
      return () => unsubscribe();
    }
  }, [product, tenantId]);

  if (!product) return null;

  return (
    <Modal isOpen={true} onClose={onClose} title={`Historial de: ${product.name}`}>
      {isLoading ? (
        <p>Cargando historial...</p>
      ) : movements.length === 0 ? (
        <p>Este producto aún no tiene movimientos.</p>
      ) : (
        <table className="history-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Cambio</th>
              <th>Stock Resultante</th>
            </tr>
          </thead>
          <tbody>
            {movements.map(move => (
              <tr key={move.id}>
                <td>{move.timestamp && move.timestamp.toDate ? move.timestamp.toDate().toLocaleString() : 'Fecha no disponible'}</td>
                <td>{move.type}</td>
                <td className={move.quantityChange > 0 ? 'positive' : 'negative'}>
                  {move.quantityChange > 0 ? `+${move.quantityChange}` : move.quantityChange}
                </td>
                <td>{move.newStock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Modal>
  );
};

export default ProductHistoryModal;