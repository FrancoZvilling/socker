// src/components/devoluciones/ReturnModal.jsx
import React, { useState, useMemo } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../../utils/formatters';
import './ReturnModal.css';

const ReturnModal = ({ isOpen, onClose, saleData, onSubmitReturn }) => {
  // Estado para guardar las cantidades a devolver de cada producto
  const [returnQuantities, setReturnQuantities] = useState({});

  // Función para manejar el cambio en los inputs de cantidad
  const handleQuantityChange = (productId, value) => {
    const quantity = parseInt(value, 10) || 0;
    const originalItem = saleData.items.find(item => item.id === productId);

    // Validación: no se puede devolver más de lo que se compró
    if (quantity > originalItem.quantity) {
      toast.error(`No se pueden devolver más de ${originalItem.quantity} unidades.`);
      return;
    }
    if (quantity < 0) return;

    setReturnQuantities({
      ...returnQuantities,
      [productId]: quantity,
    });
  };

  // Calculamos el valor total de la devolución
  const totalReturnedValue = useMemo(() => {
    return saleData.items.reduce((total, item) => {
      const returnQty = returnQuantities[item.id] || 0;
      return total + (returnQty * item.price);
    }, 0);
  }, [returnQuantities, saleData.items]);

  // Prepara y envía los datos de la devolución
  const handleSubmit = () => {
    const returnedItems = saleData.items
      .map(item => ({
        ...item,
        returnQuantity: returnQuantities[item.id] || 0,
      }))
      .filter(item => item.returnQuantity > 0);

    if (returnedItems.length === 0) {
      toast.error('Debe seleccionar al menos un producto para devolver.');
      return;
    }

    onSubmitReturn({
      originalSaleId: saleData.id,
      returnedItems,
      totalReturnedValue,
      client: saleData.client,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Registrar Devolución (Venta ID: ${saleData.id})`}>
      <div className="return-modal-content">
        <div className="return-items-list">
          <div className="return-list-header">
            <span>Producto</span>
            <span>Cant. Vendida</span>
            <span>Cant. a Devolver</span>
          </div>
          {saleData.items.map(item => (
            <div key={item.id} className="return-item-row">
              <span>{item.name}</span>
              <span>{item.quantity}</span>
              <input
                type="number"
                min="0"
                max={item.quantity}
                value={returnQuantities[item.id] || 0}
                onChange={(e) => handleQuantityChange(item.id, e.target.value)}
              />
            </div>
          ))}
        </div>
        <div className="return-footer">
          <h3>Total a Devolver: {formatCurrency(totalReturnedValue)}</h3>
          <Button onClick={handleSubmit} type="primary">Confirmar Devolución</Button>
        </div>
      </div>
    </Modal>
  );
};

export default ReturnModal;