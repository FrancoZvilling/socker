// src/components/proveedores/SupplierForm.jsx
import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
// Podemos reutilizar los estilos del formulario de productos
import '../../components/inventario/ProductForm.css';

const SupplierForm = ({ onFormSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    name: '', taxId: '', phone: '', email: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ name: '', taxId: '', phone: '', email: '' });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFormSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input label="Nombre o Razón Social" name="name" value={formData.name} onChange={handleChange} placeholder="Ej: Distribuidora Central S.A." />
      <Input label="CUIT / RUT (Opcional)" name="taxId" value={formData.taxId} onChange={handleChange} placeholder="Ej: 30-12345678-9" />
      <Input label="Teléfono (Opcional)" name="phone" value={formData.phone} onChange={handleChange} placeholder="Ej: 11 2233-4455" />
      <Input label="Email (Opcional)" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="ejemplo@proveedor.com" />
      <div className="form-actions">
        <Button type="primary">
          {initialData ? 'Guardar Cambios' : 'Guardar Proveedor'}
        </Button>
      </div>
    </form>
  );
};

export default SupplierForm;