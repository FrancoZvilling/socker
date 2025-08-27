// src/pages/ProveedoresPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSuppliersRealtime, addSupplier, updateSupplier, deleteSupplier } from '../services/supplierService';
import SupplierTable from '../components/proveedores/SupplierTable';
import SupplierForm from '../components/proveedores/SupplierForm';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { FiPlus } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import '../styles/common.css';

const ProveedoresPage = () => {
  const { userData } = useAuth(); // <-- CAMBIO
  const tenantId = userData?.tenantId;

  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!tenantId) return;

    // --- 3. Pasa el tenantId al servicio ---
    const unsubscribe = getSuppliersRealtime(tenantId, (fetchedSuppliers) => {
      setSuppliers(fetchedSuppliers);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [tenantId]); // <-- 4. El efecto depende de tenantId

  const filteredSuppliers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return suppliers;
    return suppliers.filter(supplier =>
      supplier.name.toLowerCase().includes(term) ||
      (supplier.taxId && supplier.taxId.includes(term))
    );
  }, [suppliers, searchTerm]);

  const handleOpenModal = (supplier = null) => {
    setSupplierToEdit(supplier);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSupplierToEdit(null);
    setIsModalOpen(false);
  };

  const handleFormSubmit = (supplierData) => {
    let promise;
    if (supplierToEdit) {
      // --- 3. Pasa el tenantId ---
      promise = updateSupplier(tenantId, supplierToEdit.id, supplierData);
      toast.promise(promise, {
        loading: 'Actualizando proveedor...',
        success: <b>¡Proveedor actualizado!</b>,
        error: <b>No se pudo actualizar.</b>,
      });
    } else {
      // --- 3. Pasa el tenantId ---
      promise = addSupplier(tenantId, supplierData);
      toast.promise(promise, {
        loading: 'Guardando proveedor...',
        success: <b>¡Proveedor guardado!</b>,
        error: <b>No se pudo guardar.</b>,
      });
    }
    promise.then(() => handleCloseModal());
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, ¡eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // --- 3. Pasa el tenantId ---
        const promise = deleteSupplier(tenantId, id);
        toast.promise(promise, {
          loading: 'Eliminando proveedor...',
          success: <b>¡Proveedor eliminado!</b>,
          error: <b>No se pudo eliminar.</b>,
        });
      }
    });
  };

  return (
    <div className="suppliers-page">
      <header className="page-header">
        <h1>Gestión de Proveedores</h1>
        <Button onClick={() => handleOpenModal()} icon={<FiPlus />}>
          Añadir Proveedor
        </Button>
      </header>
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar por nombre o CUIT..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {isLoading ? (
        <p>Cargando proveedores...</p>
      ) : (
        <SupplierTable 
          suppliers={filteredSuppliers}
          onEdit={handleOpenModal} 
          onDelete={handleDelete} 
        />
      )}

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={supplierToEdit ? "Editar Proveedor" : "Añadir Nuevo Proveedor"}
        >
          {/* Le pasamos el tenantId al formulario para que pueda usarlo si lo necesita */}
          <SupplierForm onFormSubmit={handleFormSubmit} initialData={supplierToEdit} />
        </Modal>
      )}
    </div>
  );
};

export default ProveedoresPage;