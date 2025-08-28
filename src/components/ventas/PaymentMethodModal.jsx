// src/components/ventas/PaymentMethodModal.jsx
import React from 'react';
import Modal from '../common/Modal';
import { FiDollarSign, FiCreditCard, FiSmartphone } from 'react-icons/fi';
import './PaymentMethodModal.css';

const PaymentMethodModal = ({ isOpen, onClose, onSelectMethod, totalAmount }) => {
  const paymentMethods = [
    { name: 'Efectivo', key: 'cash', icon: <FiDollarSign /> },
    { name: 'Tarjeta', key: 'card', icon: <FiCreditCard /> },
    { name: 'Transferencia / QR', key: 'transfer', icon: <FiSmartphone /> },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Seleccionar Método de Pago">
      <div className="payment-modal-content">
        <div className="payment-total">
          <span>Total a Pagar:</span>
          <strong>{totalAmount}</strong>
        </div>
        <div className="payment-methods-grid">
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