// src/components/inventario/ProductForm.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { addProduct, updateProduct, createMovement } from '../../services/productService';
import { getSuppliersRealtime } from '../../services/supplierService';
import Input from '../common/Input';
import Button from '../common/Button';
import { toast } from 'react-hot-toast';
import './ProductForm.css';

const ProductForm = ({ onFormSubmit, initialData }) => {
  const { userData } = useAuth(); // <-- CAMBIO
  const tenantId = userData?.tenantId;

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    stock: '',
    minStock: '',
    price: '',
    costPrice: '',
    supplierId: '',
  });
  
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    if (!tenantId) return;
    const unsubscribe = getSuppliersRealtime(tenantId, setSuppliers);
    return () => unsubscribe();
  }, [tenantId]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        minStock: initialData.minStock || '',
        costPrice: initialData.costPrice || '',
        supplierId: initialData.supplierId || '',
      });
    } else {
      setFormData({
        name: '', sku: '', category: '', stock: '', minStock: '',
        price: '', costPrice: '', supplierId: '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!tenantId) {
      toast.error("Error: No se ha identificado el negocio. Recargue la página.");
      return;
    }
    
    const selectedSupplier = suppliers.find(s => s.id === formData.supplierId);
    const productData = {
      name: formData.name,
      sku: formData.sku,
      category: formData.category,
      stock: Number(formData.stock),
      minStock: Number(formData.minStock),
      price: Number(formData.price),
      costPrice: Number(formData.costPrice),
      supplierId: formData.supplierId,
      supplierName: selectedSupplier ? selectedSupplier.name : 'N/A',
    };

    let promise;
    if (initialData) {
      promise = updateProduct(tenantId, initialData.id, productData);
      if (Number(initialData.stock) !== productData.stock) {
        const quantityChange = productData.stock - Number(initialData.stock);
        const movementData = {
          productId: initialData.id,
          productName: productData.name,
          type: 'Ajuste Manual',
          quantityChange,
          previousStock: Number(initialData.stock),
          newStock: productData.stock,
          timestamp: new Date(),
        };
        createMovement(tenantId, movementData);
      }
      toast.promise(promise, {
        loading: 'Actualizando producto...',
        success: <b>¡Producto actualizado!</b>,
        error: <b>No se pudo actualizar.</b>,
      });
    } else {
      promise = addProduct(tenantId, { ...productData, createdAt: new Date() });
      toast.promise(promise, {
        loading: 'Guardando producto...',
        success: <b>¡Producto guardado!</b>,
        error: <b>No se pudo guardar.</b>,
      });
    }

    promise.then(() => {
      onFormSubmit();
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input label="Nombre del Producto" name="name" value={formData.name} onChange={handleChange} />
      <Input label="SKU / Código" name="sku" value={formData.sku} onChange={handleChange} />
      <Input label="Categoría" name="category" value={formData.category} onChange={handleChange} />

      <div className="input-group">
        <label htmlFor="supplierId">Proveedor</label>
        <select id="supplierId" name="supplierId" value={formData.supplierId} onChange={handleChange}>
          <option value="">Seleccione un proveedor</option>
          {suppliers.map(supplier => (
            <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <Input label={initialData ? "Stock Actual" : "Stock Inicial"} name="stock" type="number" value={formData.stock} onChange={handleChange} />
        <Input label="Stock Mínimo" name="minStock" type="number" value={formData.minStock} onChange={handleChange} />
      </div>

      <div className="form-row">
        <Input label="Precio de Costo" name="costPrice" type="number" value={formData.costPrice} onChange={handleChange} placeholder="Ej: 10.50" />
        <Input label="Precio de Venta" name="price" type="number" value={formData.price} onChange={handleChange} placeholder="Ej: 15.50" />
      </div>

      <div className="form-actions">
        <Button type="primary">
          {initialData ? 'Guardar Cambios' : 'Guardar Producto'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;