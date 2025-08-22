// src/components/clientes/ClientForm.jsx
import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import '../../components/inventario/ProductForm.css'; // Reutilizamos estilos

const ClientForm = ({ onFormSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    name: '', idNumber: '', phone: '', email: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ name: '', idNumber: '', phone: '', email: '' });
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
      <Input label="Nombre y Apellido" name="name" value={formData.name} onChange={handleChange} placeholder="Ej: Juan Pérez" />
      <Input label="DNI o CUIT (Opcional)" name="idNumber" value={formData.idNumber} onChange={handleChange} placeholder="Ej: 20-12345678-9" />
      <Input label="Teléfono (Opcional)" name="phone" value={formData.phone} onChange={handleChange} placeholder="Ej: 11 2233-4455" />
      <Input label="Email (Opcional)" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="juan.perez@email.com" />
      <div className="form-actions">
        <Button type="primary">
          {initialData ? 'Guardar Cambios' : 'Guardar Cliente'}
        </Button>
      </div>
    </form>
  );
};
export default ClientForm;