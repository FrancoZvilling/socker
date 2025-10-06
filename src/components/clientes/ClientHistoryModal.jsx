// src/components/clientes/ClientHistoryModal.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Modal from '../common/Modal';
import { getClientSalesRealtime } from '../../services/saleService';
import { markSaleAsPaid } from '../../services/paymentService';
import { formatCurrency, daysSince } from '../../utils/formatters'; 
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { FiCheckSquare } from 'react-icons/fi';
import './ClientHistoryModal.css';

const ClientHistoryModal = ({ client, onClose }) => {
  const { userData } = useAuth();
  const tenantId = userData?.tenantId;

  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (client && tenantId) {
      const unsubscribe = getClientSalesRealtime(tenantId, client.id, (fetchedSales) => {
        setSales(fetchedSales);
        setIsLoading(false);
      });
      return () => unsubscribe();
    }
  }, [client, tenantId]);

  const handleMarkAsPaid = (saleId) => {
    Swal.fire({
      title: '¿Confirmar Pago de esta Venta?',
      text: "Esto marcará la venta como pagada y ajustará el saldo del cliente.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, confirmar pago',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const promise = markSaleAsPaid(tenantId, saleId);
        toast.promise(promise, {
          loading: 'Registrando pago específico...',
          success: <b>¡Pago registrado!</b>,
          error: (err) => <b>{err.message}</b>,
        });
      }
    });
  };

  if (!client) return null;

  return (
    <Modal isOpen={true} onClose={onClose} title={`Estado de Cuenta: ${client.name}`}>
      
      <div className="account-summary simple">
        <div className="balance-display">
          <span>Saldo Actual</span>
          <span className={`balance-amount ${client.balance > 0 ? 'debt' : ''} ${client.balance < 0 ? 'credit' : ''}`}>
            {formatCurrency(client.balance || 0)}
          </span>
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
                <th>Tiempo de Deuda</th>
                {/* No hay cabecera de Acciones, volvemos a 4 columnas */}
              </tr>
            </thead>
            <tbody>
              {sales.map(sale => (
                <tr key={sale.id}>
                  <td>{sale.createdAt ? sale.createdAt.toDate().toLocaleString() : 'N/A'}</td>
                  <td>{formatCurrency(sale.total)}</td>
                  <td className={`status-cell ${sale.paymentStatus === 'pending' ? 'status-pending' : 'status-paid'}`}>
                    {sale.paymentStatus === 'pending' ? 'A crédito' : 'Pagado'}
                  </td>
                  
                  {/* Se mantiene la estructura de una sola celda 'td' */}
                  <td className="debt-age-cell">
                    {sale.paymentStatus === 'pending' && sale.createdAt ? (
                      // Se envuelve el contenido en el 'div' 'debt-actions' para la alineación
                      <div className="debt-actions">
                        <span>{`${daysSince(sale.createdAt.toDate())} días`}</span>
                        <button 
                          className="icon-button paid-button" 
                          title="Marcar como Pagada"
                          onClick={() => handleMarkAsPaid(sale.id)}
                        >
                          <FiCheckSquare />
                        </button>
                      </div>
                    ) : (
                      '-'
                    )}
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