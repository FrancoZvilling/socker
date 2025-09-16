// src/components/promociones/ComboForm.jsx
import React, { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { FiTrash2 } from 'react-icons/fi';
import './ComboForm.css';

const ComboForm = ({ products, onFormSubmit, initialData }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [price, setPrice] = useState(initialData?.price || '');
  const [components, setComponents] = useState(initialData?.components || []);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(p =>
    searchTerm && p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddComponent = (product) => {
    if (components.find(c => c.productId === product.id)) return;
    setComponents([...components, { productId: product.id, productName: product.name, quantity: 1 }]);
    setSearchTerm('');
  };

  // --- FUNCIÓN 'onChange' SIMPLIFICADA ---
  const handleUpdateQuantity = (productId, value) => {
    // Simplemente actualiza el estado con lo que el usuario escribe,
    // convirtiéndolo a número. Permite que sea 0 o vacío temporalmente.
    setComponents(components.map(c => 
      c.productId === productId ? { ...c, quantity: value } : c
    ));
  };

  // --- NUEVA FUNCIÓN 'onBlur' ---
  // Se ejecuta cuando el usuario hace clic fuera del input.
  const handleQuantityBlur = (productId, value) => {
    // Convierte el valor a un número
    const numValue = parseInt(value, 10);
    // Si el valor no es un número válido o es menor que 1, lo corregimos a 1.
    if (isNaN(numValue) || numValue < 1) {
      setComponents(components.map(c => 
        c.productId === productId ? { ...c, quantity: 1 } : c
      ));
    } else {
      // Si es válido, nos aseguramos de que esté guardado como número.
       setComponents(components.map(c => 
        c.productId === productId ? { ...c, quantity: numValue } : c
      ));
    }
  };
  // -------------------------

  const handleRemoveComponent = (productId) => {
    setComponents(components.filter(c => c.productId !== productId));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFormSubmit({ name, price: parseFloat(price) || 0, components });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input label="Nombre del Combo" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      <Input label="Precio de Venta del Combo" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
      
      <div className="components-section">
        <h4>Componentes del Combo</h4>
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
                <div key={product.id} className="autocomplete-item" onClick={() => handleAddComponent(product)}>
                  {product.name}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="components-list">
          {components.map(comp => (
            <div key={comp.productId} className="component-item">
              <span>{comp.productName}</span>
              <div className="quantity-control">
                <input 
                  type="number"
                  // --- INPUT MODIFICADO ---
                  value={comp.quantity}
                  onChange={(e) => handleUpdateQuantity(comp.productId, e.target.value)}
                  onBlur={(e) => handleQuantityBlur(comp.productId, e.target.value)} // Añadimos el onBlur
                />
                <label>unidades</label>
              </div>
              <button type="button" className="remove-component-btn" onClick={() => handleRemoveComponent(comp.productId)}><FiTrash2 /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="form-actions">
        <Button type="primary" disabled={!name || !price || components.length === 0}>
          {initialData ? 'Guardar Cambios' : 'Crear Combo'}
        </Button>
      </div>
    </form>
  );
};
export default ComboForm;