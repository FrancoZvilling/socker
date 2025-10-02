// src/components/finanzas/TransactionForm.jsx
import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';

const TransactionForm = ({ onFormSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    dueDate: '',
    type: 'income',
    status: 'pending',
  });

  // --- useEffect MODIFICADO PARA SER MÁS ROBUSTO CON LAS FECHAS ---
  useEffect(() => {
    if (initialData) {
      let dateToFormat = initialData.dueDate;
      
      // Si 'dueDate' es un objeto Timestamp de Firebase, lo convertimos a un objeto Date de JavaScript.
      if (dateToFormat && typeof dateToFormat.toDate === 'function') {
        dateToFormat = dateToFormat.toDate();
      }
      
      // Aseguramos que 'dateToFormat' sea un objeto Date válido antes de continuar.
      // Si no lo es, dejamos la fecha vacía para evitar errores.
      const isValidDate = dateToFormat instanceof Date && !isNaN(dateToFormat);
      
      const formattedDate = isValidDate 
        ? new Date(dateToFormat).toISOString().split('T')[0] 
        : '';
      
      setFormData({ ...initialData, dueDate: formattedDate });
    } else {
      setFormData({ description: '', amount: '', dueDate: '', type: 'income', status: 'pending' });
    }
  }, [initialData]);
  // -----------------------------------------------------------

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFormSubmit({ ...formData, amount: parseFloat(formData.amount) || 0 });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="input-group">
        <label>Tipo de Transacción</label>
        <select name="type" value={formData.type} onChange={handleChange}>
          <option value="income">Ingreso por Cobrar</option>
          <option value="expense">Egreso por Pagar</option>
        </select>
      </div>
      <Input label="Descripción" name="description" value={formData.description} onChange={handleChange} autoFocus />
      <Input label="Monto" name="amount" type="number" value={formData.amount} onChange={handleChange} />
      <Input label="Fecha de Vencimiento" name="dueDate" type="date" value={formData.dueDate} onChange={handleChange} />
      <div className="form-actions">
        <Button type="primary">{initialData ? 'Guardar Cambios' : 'Guardar Transacción'}</Button>
      </div>
    </form>
  );
};

export default TransactionForm;