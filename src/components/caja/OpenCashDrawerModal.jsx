// src/components/caja/OpenCashDrawerModal.jsx
import React, { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/formatters';

const OpenCashDrawerModal = ({ isOpen, onClose, onOpen }) => {
  const [amount, setAmount] = useState('');

  const handleOpen = () => {
    const openingAmount = parseFloat(amount);
    if (isNaN(openingAmount) || openingAmount < 0) {
      alert('Por favor, ingrese un monto válido.');
      return;
    }
    onOpen(openingAmount);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Abrir Caja">
      <p>Introduce el monto inicial de efectivo en la caja (fondo de caja).</p>
      <Input label="Monto Inicial" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
      <div className="form-actions">
        <Button onClick={handleOpen} type="primary">Abrir Caja con {formatCurrency(parseFloat(amount) || 0)}</Button>
      </div>
    </Modal>
  );
};

export default OpenCashDrawerModal;