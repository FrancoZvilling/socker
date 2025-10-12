// src/components/ventas/PaymentMethodModal.jsx
import React from 'react';
import Modal from '../common/Modal';
// Se añade el nuevo ícono FiEdit para el método de pago 'Cheque'.
import { FiDollarSign, FiCreditCard, FiSmartphone, FiEdit } from 'react-icons/fi';
import './PaymentMethodModal.css';

const PaymentMethodModal = ({ isOpen, onClose, onSelectMethod, totalAmount }) => {
  const paymentMethods = [
    { name: 'Efectivo', key: 'cash', icon: <FiDollarSign /> },
    { name: 'Tarjeta', key: 'card', icon: <FiCreditCard /> },
    { name: 'Transferencia / QR', key: 'transfer', icon: <FiSmartphone /> },
    // Se añade el nuevo objeto para el método de pago 'Cheque'.
    { name: 'Cheque', key: 'cheque', icon: <FiEdit /> },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Seleccionar Método de Pago">
      <div className="payment-modal-content">
        <div className="payment-total">
          <span>Total a Pagar:</span>
          <strong>{totalAmount}</strong>
        </div>
        {/* Se añade la clase 'four-items' para ajustar el layout de la grilla a 2x2 */}
        <div className="payment-methods-grid four-items">
          {paymentMethods.map(method => (
            <button
              key={method.key}
              className="method-button"
              onClick={() => onSelectMethod(method.key)}
            >
              {method.icon}
              <span>{method.name}</span>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default PaymentMethodModal;