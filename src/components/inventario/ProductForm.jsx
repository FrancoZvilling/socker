// src/components/inventario/ProductForm.jsx

import React, { useState, useEffect } from 'react';
import { addProduct, updateProduct, createMovement } from '../../services/productService';
import { getSuppliersRealtime } from '../../services/supplierService';
import Input from '../common/Input';
import Button from '../common/Button';
import { toast } from 'react-hot-toast';
import './ProductForm.css';

const ProductForm = ({ onFormSubmit, initialData }) => {
  // Estado inicial del formulario con los nuevos campos
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    stock: '',
    minStock: '',
    price: '',
    costPrice: '', // Nuevo campo para Precio de Costo
    supplierId: '', // Nuevo campo para el ID del Proveedor
  });
  
  // Nuevo estado para almacenar la lista de proveedores
  const [suppliers, setSuppliers] = useState([]);

  // useEffect para obtener la lista de proveedores al cargar el componente
  useEffect(() => {
    const unsubscribe = getSuppliersRealtime(setSuppliers);
    return () => unsubscribe(); // Limpieza al desmontar
  }, []);

  // useEffect para llenar el formulario si estamos editando un producto
  useEffect(() => {
    if (initialData) {
      // Si estamos editando, llenamos el formulario con los datos existentes
      setFormData({
        ...initialData,
        minStock: initialData.minStock || '',
        costPrice: initialData.costPrice || '',

        supplierId: initialData.supplierId || '',
      });
    } else {
      // Si estamos creando, nos aseguramos de que el formulario esté vacío
      setFormData({
        name: '', sku: '', category: '', stock: '', minStock: '',
        price: '', costPrice: '', supplierId: '',
      });
    }
  }, [initialData]); // Se ejecuta cada vez que 'initialData' cambia

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Buscamos el proveedor seleccionado para guardar su nombre
    const selectedSupplier = suppliers.find(s => s.id === formData.supplierId);

    // Creamos el objeto con todos los datos del producto, incluyendo los nuevos
    const productData = {
      name: formData.name,
      sku: formData.sku,
      category: formData.category,
      stock: Number(formData.stock),
      minStock: Number(formData.minStock),
      price: Number(formData.price),
      costPrice: Number(formData.costPrice),
      supplierId: formData.supplierId,
      supplierName: selectedSupplier ? selectedSupplier.name : 'N/A', // Denormalización
    };

    let promise;

    if (initialData) {
      // Lógica de actualización (incluye la creación de movimiento de ajuste)
      promise = updateProduct(initialData.id, productData);
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
        createMovement(movementData);
      }
      toast.promise(promise, {
        loading: 'Actualizando producto...',
        success: <b>¡Producto actualizado!</b>,
        error: <b>No se pudo actualizar.</b>,
      });
    } else {
      // Lógica de creación
      promise = addProduct({ ...productData, createdAt: new Date() });
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

      {/* Menú desplegable para seleccionar el proveedor */}
      <div className="input-group">
        <label htmlFor="supplierId">Proveedor</label>
        <select
          id="supplierId"
          name="supplierId"
          value={formData.supplierId}
          onChange={handleChange}
        >
          <option value="">Seleccione un proveedor</option>
          {suppliers.map(supplier => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <Input label={initialData ? "Stock Actual" : "Stock Inicial"} name="stock" type="number" value={formData.stock} onChange={handleChange} />
        <Input label="Stock Mínimo" name="minStock" type="number" value={formData.minStock} onChange={handleChange} />
      </div>

      {/* Fila para los precios de costo y venta */}
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