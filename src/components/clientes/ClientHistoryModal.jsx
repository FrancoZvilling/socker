// src/components/clientes/ClientHistoryModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import { getClientSalesRealtime } from '../../services/saleService';
import { registerClientPayment } from '../../services/clientService'; // <-- 1. IMPORTAMOS EL SERVICIO DE PAGO
import { formatCurrency } from '../../utils/formatters';
import { toast } from 'react-hot-toast';
import './ClientHistoryModal.css'; // Crearemos/actualizaremos este archivo

const ClientHistoryModal = ({ client, onClose }) => {
  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentAmount, setPaymentAmount] = useState(''); // <-- 2. ESTADO PARA EL MONTO DEL PAGO

  useEffect(() => {
    if (client) {
      const unsubscribe = getClientSalesRealtime(client.id, (fetchedSales) => {
        // Por ahora solo mostramos ventas. Más adelante combinaremos con pagos.
        setSales(fetchedSales);
        setIsLoading(false);
      });
      return () => unsubscribe();
    }
  }, [client]);

  // --- 3. FUNCIÓN PARA MANEJAR EL REGISTRO DE PAGO ---
  const handleRegisterPayment = () => {
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      toast.error('Por favor, ingrese un monto válido.');
      return;
    }

    const promise = registerClientPayment(client.id, amount);
    toast.promise(promise, {
      loading: 'Registrando pago...',
      success: <b>¡Pago registrado con éxito!</b>,
      error: <b>Error al registrar el pago.</b>,
    });
    
    promise.then(() => {
      setPaymentAmount(''); // Limpiamos el input después del éxito
      onClose();
    });
  };

  if (!client) return null;

  return (
    // Usaremos un título más apropiado
    <Modal isOpen={true} onClose={onClose} title={`Estado de Cuenta: ${client.name}`}>
      {/* --- 4. SECCIÓN DEL SALDO Y FORMULARIO DE PAGO --- */}
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
        <p>Este cliente aún no ha realizado compras a crédito.</p>
      ) : (
        <div className="table-container">
          {/* La tabla de ventas por ahora se mantiene igual */}
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
                    {sale.paymentStatus === 'pending' ? 'Pendiente' : 'Pagado'}
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