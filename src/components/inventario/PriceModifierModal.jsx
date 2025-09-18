// src/components/inventario/modals/PriceModifierModal.jsx
import React, { useState, useMemo } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';

const PriceModifierModal = ({ isOpen, onClose, onSubmit, products, suppliers }) => {
  const [percentage, setPercentage] = useState('');
  const [operation, setOperation] = useState('increase');
  const [targetPrices, setTargetPrices] = useState('sale');
  const [category, setCategory] = useState('');
  const [supplierId, setSupplierId] = useState('');

  const uniqueCategories = useMemo(() => {
    return [...new Set(products.map(p => p.category).filter(Boolean))];
  }, [products]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      percentage: parseFloat(percentage),
      operation,
      targetPrices,
      category: category || null,
      supplierId: supplierId || null,
    };
    onSubmit(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modificador de Precios Masivo">
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Acción</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <select value={operation} onChange={(e) => setOperation(e.target.value)} style={{flex: 1}}>
              <option value="increase">Aumentar</option>
              <option value="decrease">Bajar</option>
            </select>
            <Input type="number" value={percentage} onChange={(e) => setPercentage(e.target.value)} placeholder="Ej: 5.5" />
            <span>%</span>
          </div>
        </div>

        <div className="input-group">
          <label>Aplicar a</label>
          <select value={targetPrices} onChange={(e) => setTargetPrices(e.target.value)}>
            <option value="sale">Solo Precios de Venta</option>
            <option value="cost">Solo Precios de Costo</option>
            <option value="both">Ambos Precios (Venta y Costo)</option>
          </select>
        </div>

        <div className="input-group">
          <label>Filtrar por Proveedor (Opcional)</label>
          <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
            <option value="">Todos los Proveedores</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div className="input-group">
          <label>Filtrar por Categoría (Opcional)</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Todas las Categorías</option>
            {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        <div className="form-actions">
          <Button type="primary" disabled={!percentage}>Aplicar Cambios</Button>
        </div>
      </form>
    </Modal>
  );
};
export default PriceModifierModal;