// src/components/clientes/ClientHistoryModal.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import { getClientSalesRealtime } from '../../services/saleService';
import { registerClientPayment } from '../../services/clientService';
import { formatCurrency } from '../../utils/formatters';
import { toast } from 'react-hot-toast';
import './ClientHistoryModal.css';

const ClientHistoryModal = ({ client, onClose }) => {
  const { userData } = useAuth(); // <-- CAMBIO
  const tenantId = userData?.tenantId;

  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentAmount, setPaymentAmount] = useState('');

  useEffect(() => {
    // El efecto ahora depende de que existan tanto el cliente como el tenantId
    if (client && tenantId) {
      // --- 3. Pasa el tenantId a la llamada del servicio ---
      const unsubscribe = getClientSalesRealtime(tenantId, client.id, (fetchedSales) => {
        setSales(fetchedSales);
        setIsLoading(false);
      });
      return () => unsubscribe();
    }
  }, [client, tenantId]); // <-- 4. El efecto ahora depende también de tenantId

  const handleRegisterPayment = () => {
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      toast.error('Por favor, ingrese un monto válido.');
      return;
    }

    // --- 3. Pasa el tenantId a la llamada del servicio ---
    const promise = registerClientPayment(tenantId, client.id, amount);
    toast.promise(promise, {
      loading: 'Registrando pago...',
      success: <b>¡Pago registrado con éxito!</b>,
      error: <b>Error al registrar el pago.</b>,
    });
    
    promise.then(() => {
      setPaymentAmount('');
      onClose();
    });
  };

  if (!client) return null;

  return (
    <Modal isOpen={true} onClose={onClose} title={`Estado de Cuenta: ${client.name}`}>
      <div className="account-summary">
        <div className="balance-display">
          <span>Saldo Actual</span>
          <span
            className={`
              balance-amount 
              ${client.balance > 0 ? 'debt' : ''} 
              ${client.balance < 0 ? 'credit' : ''}
            `}
          >
            {formatCurrency(client.balance || 0)}
          </span>
        </div>
        <div className="payment-form">
          <Input
            name="payment"
            type="number"
            placeholder="Monto a pagar"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
          />
          <Button onClick={handleRegisterPayment} type="primary">
            Registrar Pago
          </Button>
        </div>
      </div>

      <h4 className="history-title">Historial de Compras</h4>
      {isLoading ? (
        <p>Cargando historial...</p>
      ) : sales.length === 0 ? (
        <p>Este cliente aún no ha realizado compras.</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Total de la Venta</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(sale => (
                <tr key={sale.id}>
                  <td>{sale.createdAt ? sale.createdAt.toDate().toLocaleString() : 'N/A'}</td>
                  <td>{formatCurrency(sale.total)}</td>
                  <td className={sale.paymentStatus === 'pending' ? 'status-pending' : 'status-paid'}>
                    {sale.paymentStatus === 'pending' ? 'A crédito' : 'Pagado'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
};

export default ClientHistoryModal;