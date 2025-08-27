// src/pages/InventarioPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiPlus } from 'react-icons/fi';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';

// Servicios
import { getProductsRealtime, deleteProduct } from '../services/productService';
import { getSuppliersRealtime } from '../services/supplierService';
import { registerPurchase } from '../services/purchaseService';

// Componentes
import ProductTable from '../components/inventario/ProductTable';
import ProductForm from '../components/inventario/ProductForm';
import ProductHistoryModal from '../components/inventario/ProductHistoryModal';
import RegisterPurchaseModal from '../components/compras/RegisterPurchaseModal';

// Estilos
import './InventarioPage.css';
import '../styles/common.css'; // Asegúrate de que los estilos comunes estén aquí

const InventarioPage = () => {
  const { userData } = useAuth(); 
  const tenantId = userData?.tenantId;

  // Estados
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [productToEdit, setProductToEdit] = useState(null);
  const [selectedProductForHistory, setSelectedProductForHistory] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Efecto para cargar datos iniciales
  useEffect(() => {
    if (!tenantId) return;

    const unsubscribeProducts = getProductsRealtime(tenantId, (fetchedProducts) => {
      setProducts(fetchedProducts);
      setIsLoading(false);
    });
    const unsubscribeSuppliers = getSuppliersRealtime(tenantId, setSuppliers);
    
    return () => {
      unsubscribeProducts();
      unsubscribeSuppliers();
    };
  }, [tenantId]);

  // Lógica de filtrado
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const categoryMatch = selectedCategory ? product.category === selectedCategory : true;
      const searchTermLower = searchTerm.toLowerCase();
      const searchMatch = product.name.toLowerCase().includes(searchTermLower) || (product.sku && product.sku.toLowerCase().includes(searchTermLower));
      return categoryMatch && searchMatch;
    });
  }, [products, searchTerm, selectedCategory]);

  const uniqueCategories = useMemo(() => {
    if (!products) return [];
    return [...new Set(products.map(p => p.category))];
  }, [products]);

  // Handlers para el modal de Producto
  const handleOpenProductModal = (product = null) => {
    setProductToEdit(product);
    setIsProductModalOpen(true);
  };
  const handleCloseProductModal = () => setIsProductModalOpen(false);

  // Handlers para el modal de Historial
  const handleShowHistory = (product) => {
    setSelectedProductForHistory(product);
    setIsHistoryModalOpen(true);
  };
  const handleCloseHistoryModal = () => setIsHistoryModalOpen(false);

  // Handler para el modal de Compras
  const handleRegisterPurchase = (purchaseData) => {
    const promise = registerPurchase(tenantId, purchaseData);
    toast.promise(promise, {
      loading: 'Registrando compra...',
      success: <b>¡Compra registrada con éxito!</b>,
      error: <b>Error al registrar la compra.</b>,
    });
    promise.then(() => setIsPurchaseModalOpen(false));
  };
  
  // Handler para eliminar un producto
  const handleDeleteProduct = (id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, ¡eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const promise = deleteProduct(tenantId, id);
        toast.promise(promise, {
          loading: 'Eliminando producto...',
          success: <b>¡Producto eliminado!</b>,
          error: <b>No se pudo eliminar.</b>,
        });
      }
    });
  };

  return (
    <div className="inventory-page">
      <header className="page-header">
        <h1>Inventario de Productos</h1>
        <div className="header-actions">
          <Button onClick={() => setIsPurchaseModalOpen(true)}>
            Registrar Compra
          </Button>
          <Button onClick={() => handleOpenProductModal()} icon={<FiPlus />}>
            Agregar Producto
          </Button>
        </div>
      </header>
      
      <div className="filters-container">
        <input type="text" placeholder="Buscar por nombre o SKU..." className="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <select className="category-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="">Todas las categorías</option>
          {uniqueCategories.map(category => <option key={category} value={category}>{category}</option>)}
        </select>
      </div>

      {isLoading ? (
        <p>Cargando productos...</p>
      ) : (
        <ProductTable
          products={filteredProducts}
          onEditProduct={handleOpenProductModal}
          onDeleteProduct={handleDeleteProduct}
          onShowHistory={handleShowHistory}
        />
      )}

      {isProductModalOpen && (
        <Modal isOpen={isProductModalOpen} onClose={handleCloseProductModal} title={productToEdit ? "Editar Producto" : "Agregar Nuevo Producto"}>
          <ProductForm onFormSubmit={handleCloseProductModal} initialData={productToEdit} />
        </Modal>
      )}

      {isHistoryModalOpen && (
        <ProductHistoryModal product={selectedProductForHistory} onClose={handleCloseHistoryModal} />
      )}

      {isPurchaseModalOpen && (
        <RegisterPurchaseModal
          isOpen={isPurchaseModalOpen}
          onClose={() => setIsPurchaseModalOpen(false)}
          suppliers={suppliers}
          products={products}
          onRegisterPurchase={handleRegisterPurchase}
        />
      )}
    </div>
  );
};

export default InventarioPage;