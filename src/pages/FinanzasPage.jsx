// src/pages/FinanzasPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPendingTransactionsRealtime, addTransaction, updateTransaction, deleteTransaction } from '../services/transactionService';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import TransactionsTable from '../components/finanzas/TransactionsTable';
import TransactionForm from '../components/finanzas/TransactionForm';
import { FiPlus } from 'react-icons/fi';
import { formatCurrency } from '../utils/formatters';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import './FinanzasPage.css';

const FinanzasPage = () => {
  const { userData } = useAuth();
  const tenantId = userData?.tenantId;

  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('income');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState(null);

  useEffect(() => {
    if (!tenantId) return;
    const unsubscribe = getPendingTransactionsRealtime(tenantId, (fetchedTransactions) => {
      setTransactions(fetchedTransactions);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [tenantId]);

  // Lógica para filtrar y calcular los totales
  const { incomeTransactions, expenseTransactions, totalToReceive, totalToPay, netBalance } = useMemo(() => {
    const income = transactions.filter(tx => tx.type === 'income');
    const expense = transactions.filter(tx => tx.type === 'expense');
    const toReceive = income.reduce((sum, tx) => sum + tx.amount, 0);
    const toPay = expense.reduce((sum, tx) => sum + tx.amount, 0);
    return {
      incomeTransactions: income,
      expenseTransactions: expense,
      totalToReceive: toReceive,
      totalToPay: toPay,
      netBalance: toReceive - toPay,
    };
  }, [transactions]);

  // Handlers para el modal
  const handleOpenModal = (tx = null) => {
    setTransactionToEdit(tx);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => setIsModalOpen(false);

  // Handlers para las acciones CRUD
  const handleFormSubmit = (txData) => {
    let promise;
    if (transactionToEdit) {
      promise = updateTransaction(tenantId, transactionToEdit.id, txData);
      toast.promise(promise, { loading: 'Actualizando...', success: '¡Actualizado!', error: 'Error.' });
    } else {
      promise = addTransaction(tenantId, txData);
      toast.promise(promise, { loading: 'Guardando...', success: '¡Guardado!', error: 'Error.' });
    }
    promise.then(handleCloseModal);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: '¿Estás seguro?', text: "Se eliminará este registro.", icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        toast.promise(deleteTransaction(tenantId, id), {
          loading: 'Eliminando...', success: '¡Eliminado!', error: 'Error.'
        });
      }
    });
  };

  const handleMarkAsCompleted = (id) => {
    toast.promise(updateTransaction(tenantId, id, { status: 'completed' }), {
      loading: 'Marcando como completado...',
      success: '¡Transacción completada!',
      error: 'Error.',
    });
  };

  return (
    <div className="finance-page">
      <header className="page-header">
        <h1>Administrador Financiero</h1>
        <Button onClick={() => handleOpenModal()} icon={<FiPlus />}>
          Añadir Transacción
        </Button>
      </header>

      <div className="summary-cards-container">
        <div className="summary-card"><h4>Total por Cobrar (Pendiente)</h4><p className="amount income">{formatCurrency(totalToReceive)}</p></div>
        <div className="summary-card"><h4>Total por Pagar (Pendiente)</h4><p className="amount expense">{formatCurrency(totalToPay)}</p></div>
        <div className="summary-card"><h4>Balance Neto Futuro</h4><p className={`amount ${netBalance >= 0 ? 'income' : 'expense'}`}>{formatCurrency(netBalance)}</p></div>
      </div>

      <div className="transactions-container">
        <div className="tabs">
          <button className={`tab ${activeTab === 'income' ? 'active' : ''}`} onClick={() => setActiveTab('income')}>Ingresos por Cobrar</button>
          <button className={`tab ${activeTab === 'expense' ? 'active' : ''}`} onClick={() => setActiveTab('expense')}>Egresos por Pagar</button>
        </div>
        <div className="tab-content">
          {isLoading ? <p>Cargando transacciones...</p> : (
            activeTab === 'income' ? (
              <TransactionsTable transactions={incomeTransactions} onEdit={handleOpenModal} onDelete={handleDelete} onMarkAsCompleted={handleMarkAsCompleted} />
            ) : (
              <TransactionsTable transactions={expenseTransactions} onEdit={handleOpenModal} onDelete={handleDelete} onMarkAsCompleted={handleMarkAsCompleted} />
            )
          )}
        </div>
      </div>

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={transactionToEdit ? 'Editar Transacción' : 'Nueva Transacción'}>
          <TransactionForm onFormSubmit={handleFormSubmit} initialData={transactionToEdit} />
        </Modal>
      )}
    </div>
  );
};
export default FinanzasPage;