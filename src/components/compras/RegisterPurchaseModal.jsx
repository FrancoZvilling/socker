// src/components/compras/RegisterPurchaseModal.jsx

import React, { useState, useMemo } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { FiTrash2 } from 'react-icons/fi';
// Ya no importamos 'react-autocomplete'
import './RegisterPurchaseModal.css';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../../utils/formatters';

// Este sub-componente representa una fila de producto en la compra
const PurchaseItemRow = ({ item, onQuantityChange, onCostChange, onRemove }) => (
  <div className="purchase-item-row">
    <span>{item.productName}</span>
    <input
      type="number"
      value={item.quantity}
      onChange={(e) => onQuantityChange(item.productId, parseInt(e.target.value) || 0)}
      placeholder="Cantidad"
    />
    <input
      type="number"
      value={item.costPrice}
      onChange={(e) => onCostChange(item.productId, parseFloat(e.target.value) || 0)}
      placeholder="Costo Unit."
    />
    <span>{formatCurrency(item.quantity * item.costPrice)}</span>
    <button onClick={() => onRemove(item.productId)}><FiTrash2 /></button>
  </div>
);

const RegisterPurchaseModal = ({ isOpen, onClose, suppliers, products, onRegisterPurchase }) => {
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [purchaseItems, setPurchaseItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddProduct = (product) => {
    if (purchaseItems.find(item => item.productId === product.id)) {
      toast.error('Este producto ya está en la lista.');
      setSearchTerm(''); // Limpiamos la búsqueda aunque haya error
      return;
    }
    const newItem = {
      productId: product.id,
      productName: product.name,
      currentStock: product.stock,
      quantity: 1,
      costPrice: product.costPrice || 0,
    };
    setPurchaseItems([...purchaseItems, newItem]);
    setSearchTerm(''); // Limpiamos la búsqueda después de añadir
  };

  const handleUpdateQuantity = (productId, quantity) => {
    setPurchaseItems(purchaseItems.map(item =>
      item.productId === productId ? { ...item, quantity } : item
    ));
  };
  const handleUpdateCost = (productId, costPrice) => {
    setPurchaseItems(purchaseItems.map(item =>
      item.productId === productId ? { ...item, costPrice } : item
    ));
  };
  const handleRemoveItem = (productId) => {
    setPurchaseItems(purchaseItems.filter(item => item.productId !== productId));
  };

  const totalCost = useMemo(() => {
    return purchaseItems.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);
  }, [purchaseItems]);

  const handleSubmit = () => {
    if (!selectedSupplier || purchaseItems.length === 0) {
      toast.error('Debe seleccionar un proveedor y añadir al menos un producto.');
      return;
    }
    const supplier = suppliers.find(s => s.id === selectedSupplier);
    const purchaseData = {
      supplierId: supplier.id,
      supplierName: supplier.name,
      items: purchaseItems,
      totalCost,
    };
    onRegisterPurchase(purchaseData);
  };

  // Filtramos la lista de productos para el autocompletado
  const filteredProducts = products.filter(p =>
    searchTerm && p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Nueva Compra">
      <div className="purchase-form">
        <select value={selectedSupplier} onChange={(e) => setSelectedSupplier(e.target.value)}>
          <option value="">-- Seleccione un Proveedor --</option>
          {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        {/* --- NUESTRO AUTOCOMPLETADO PERSONALIZADO --- */}
        <div className="autocomplete-wrapper">
          <input
            type="text"
            placeholder="Buscar producto para añadir..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {filteredProducts.length > 0 && (
            <div className="autocomplete-results">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  className="autocomplete-item"
                  onClick={() => handleAddProduct(product)}
                >
                  {product.name}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="purchase-items-list">
          <div className="purchase-list-header">
            <span>Producto</span><span>Cantidad</span><span>Costo Unit.</span><span>Subtotal</span><span></span>
          </div>
          {purchaseItems.map(item => (
            <PurchaseItemRow
              key={item.productId}
              item={item}
              onQuantityChange={handleUpdateQuantity}
              onCostChange={handleUpdateCost}
              onRemove={handleRemoveItem}
            />
          ))}
        </div>
        
        <div className="purchase-footer">
          <h3>Total de la Compra: {formatCurrency(totalCost)}</h3>
          <Button onClick={handleSubmit} type="primary">Registrar Compra</Button>
        </div>
      </div>
    </Modal>
  );
};

export default RegisterPurchaseModal;