// src/components/caja/CloseCashDrawerModal.jsx
import React, { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/formatters';
import './CloseCashDrawerModal.css';

const CloseCashDrawerModal = ({ isOpen, onClose, onCloseDrawer, sessionData }) => {
  const [countedAmount, setCountedAmount] = useState('');
  
  const expected = sessionData.expectedInCash;
  const counted = parseFloat(countedAmount) || 0;
  const difference = counted - expected;

  const handleClose = () => {
    onCloseDrawer(counted);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cerrar Caja (Arqueo)">
      <div className="summary-grid">
        <span>Fondo de Caja Inicial</span>
        <span className="amount">{formatCurrency(sessionData.openingAmount)}</span>
        <span>Ventas en Efectivo</span>
        <span className="amount">{formatCurrency(sessionData.totalSalesInCash)}</span>
        <span className="total">Total Esperado en Caja</span>
        <span className="amount total">{formatCurrency(expected)}</span>
      </div>
      <Input label="Monto Contado en Caja" type="number" value={countedAmount} onChange={(e) => setCountedAmount(e.target.value)} autoFocus />
      {countedAmount && (
        <div className="summary-grid difference">
          <span className="total">Diferencia</span>
          <span className={`amount total ${difference > 0 ? 'surplus' : difference < 0 ? 'shortage' : ''}`}>
            {formatCurrency(difference)}
          </span>
        </div>
      )}
      <div className="form-actions">
        <Button onClick={handleClose} type="primary">Confirmar y Cerrar Caja</Button>
      </div>
    </Modal>
  );
};

export default CloseCashDrawerModal;