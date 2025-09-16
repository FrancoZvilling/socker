// src/pages/PromocionesPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCombosRealtime, addCombo, updateCombo, deleteCombo } from '../services/comboService';
import { getProductsRealtime } from '../services/productService';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { FiPlus } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import ComboTable from '../components/promociones/ComboTable';
import ComboForm from '../components/promociones/ComboForm';

const PromocionesPage = () => {
  const { userData } = useAuth();
  const tenantId = userData?.tenantId;
  
  const [combos, setCombos] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [comboToEdit, setComboToEdit] = useState(null);

  useEffect(() => {
    if (!tenantId) return;
    const unsubCombos = getCombosRealtime(tenantId, setCombos);
    const unsubProducts = getProductsRealtime(tenantId, setProducts);
    
    // Simple loading state
    Promise.all([unsubCombos, unsubProducts]).then(() => setIsLoading(false));

    return () => {
      unsubCombos();
      unsubProducts();
    };
  }, [tenantId]);

  const handleOpenModal = (combo = null) => {
    setComboToEdit(combo);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setComboToEdit(null);
    setIsModalOpen(false);
  };

  const handleFormSubmit = (comboData) => {
    let promise;
    if (comboToEdit) {
      promise = updateCombo(tenantId, comboToEdit.id, comboData);
      toast.promise(promise, { loading: 'Actualizando combo...', success: '¡Combo actualizado!', error: 'No se pudo actualizar.' });
    } else {
      promise = addCombo(tenantId, comboData);
      toast.promise(promise, { loading: 'Creando combo...', success: '¡Combo creado!', error: 'No se pudo crear.' });
    }
    promise.then(handleCloseModal);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Se eliminará esta promoción de forma permanente.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, ¡eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const promise = deleteCombo(tenantId, id);
        toast.promise(promise, { loading: 'Eliminando...', success: '¡Promoción eliminada!', error: 'No se pudo eliminar.' });
      }
    });
  };

  return (
    <div className="promotions-page">
      <header className="page-header">
        <h1>Gestión de Promociones/Combos</h1>
        <Button onClick={() => handleOpenModal()} icon={<FiPlus />}>Crear Combo</Button>
      </header>

      {isLoading ? <p>Cargando promociones...</p> : (
        <ComboTable combos={combos} onEdit={handleOpenModal} onDelete={handleDelete} />
      )}

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={comboToEdit ? 'Editar Combo' : 'Nuevo Combo'}>
          <ComboForm
            products={products}
            onFormSubmit={handleFormSubmit}
            initialData={comboToEdit}
          />
        </Modal>
      )}
    </div>
  );
};

export default PromocionesPage;