// src/pages/InventarioPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAccess } from '../context/AccessContext';
import { FiPlus } from 'react-icons/fi';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';

// Servicios
import { getProductsRealtime, deleteProduct } from '../services/productService';
import { getSuppliersRealtime } from '../services/supplierService';
import { registerPurchase } from '../services/purchaseService';
import { updatePricesBulk } from '../services/priceModifierService';
import { importProductsBulk } from '../services/importService';

// Componentes
import ProductTable from '../components/inventario/ProductTable';
import ProductForm from '../components/inventario/ProductForm';
import ProductHistoryModal from '../components/inventario/ProductHistoryModal';
import RegisterPurchaseModal from '../components/compras/RegisterPurchaseModal';
import LoadingOverlay from '../components/common/LoadingOverlay';
import PriceModifierModal from '../components/inventario/PriceModifierModal';
import ProductImportModal from '../components/inventario/ProductImportModal'; // Se corrige el nombre del componente

// Estilos
import './InventarioPage.css';
import '../styles/common.css';

const InventarioPage = () => {
  const { userData } = useAuth(); 
  const { hasAdminAccess } = useAccess();
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
  const [stockFilter, setStockFilter] = useState('all');
  const [isModifierModalOpen, setIsModifierModalOpen] = useState(false);
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

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

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const categoryMatch = selectedCategory ? product.category === selectedCategory : true;
      const searchTermLower = searchTerm.toLowerCase();
      const searchMatch = product.name.toLowerCase().includes(searchTermLower) || (product.sku && product.sku.toLowerCase().includes(searchTermLower));
      
      const stockStatusMatch = () => {
        switch (stockFilter) {
          case 'low':
            return product.stock > 0 && product.stock <= (product.minStock || 0);
          case 'out':
            return product.stock <= 0;
          case 'all':
          default:
            return true;
        }
      };
      
      return categoryMatch && searchMatch && stockStatusMatch();
    });
  }, [products, searchTerm, selectedCategory, stockFilter]);

  const uniqueCategories = useMemo(() => {
    if (!products) return [];
    return [...new Set(products.map(p => p.category).filter(Boolean))];
  }, [products]);

  // Handlers
  const handleOpenProductModal = (product = null) => {
    setProductToEdit(product);
    setIsProductModalOpen(true);
  };
  const handleCloseProductModal = () => setIsProductModalOpen(false);
  const handleShowHistory = (product) => {
    setSelectedProductForHistory(product);
    setIsHistoryModalOpen(true);
  };
  const handleCloseHistoryModal = () => setIsHistoryModalOpen(false);
  const handleRegisterPurchase = (purchaseData) => {
    const promise = registerPurchase(tenantId, purchaseData);
    toast.promise(promise, {
      loading: 'Registrando compra...',
      success: <b>¡Compra registrada con éxito!</b>,
      error: <b>Error al registrar la compra.</b>,
    });
    promise.then(() => setIsPurchaseModalOpen(false));
  };
  const handleDeleteProduct = (id) => {
    Swal.fire({
      title: '¿Estás seguro?', text: "Esta acción no se puede deshacer.",
      icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, ¡eliminar!', cancelButtonText: 'Cancelar'
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

  const handleUpdatePrices = (modificationData) => {
    setIsModifierModalOpen(false);
    Swal.fire({
      title: '¿Confirmar Operación Masiva?',
      text: "Esta acción modificará los precios de múltiples productos y no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, aplicar cambios',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        setIsUpdatingPrices(true);
        const promise = updatePricesBulk(tenantId, modificationData);
        
        toast.promise(promise, {
          loading: 'Procesando... (esto puede tardar)',
          success: (res) => <b>{res.data.message}</b>,
          error: (err) => <b>Error: {err.message}</b>,
        }).finally(() => {
          setIsUpdatingPrices(false);
        });
      }
    });
  };

 const handleImportProducts = (productsToImport) => {
    // Reemplaza el console.log
    const promise = importProductsBulk(tenantId, productsToImport);
    toast.promise(promise, {
      loading: 'Importando productos... Esto puede tardar varios minutos.',
      success: (res) => <b>{res.data.message}</b>,
      error: (err) => <b>Error: {err.message}</b>,
    });
  };

  

 return (
  <div className="inventory-page">
    {isUpdatingPrices && <LoadingOverlay message="Actualizando precios..." />}
    
    <header className="page-header">
      <h1>Inventario de Productos</h1>
      <div className="header-actions">
        {hasAdminAccess() && (
          <Button onClick={() => setIsImportModalOpen(true)} type="secondary">Importar</Button>
        )}
        {hasAdminAccess() && (
          <Button onClick={() => setIsModifierModalOpen(true)}>Modificador de Precios</Button>
        )}
        <Button onClick={() => setIsPurchaseModalOpen(true)}>Registrar Compra</Button>
        <Button onClick={() => handleOpenProductModal()} icon={<FiPlus />}>Agregar Producto</Button>
      </div>
    </header>
    
    <div className="filters-container">
      <input type="text" placeholder="Buscar por nombre o SKU..." className="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      <select className="category-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
        <option value="">Todas las categorías</option>
        {uniqueCategories.map(category => <option key={category} value={category}>{category}</option>)}
      </select>
      <select
        className="category-select"
        value={stockFilter}
        onChange={(e) => setStockFilter(e.target.value)}
      >
        <option value="all">Todo el Stock</option>
        <option value="low">Stock Bajo</option>
        <option value="out">Sin Stock</option>
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
        <ProductForm onFormSubmit={handleCloseProductModal} initialData={productToEdit} categories={uniqueCategories} />
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

    {isModifierModalOpen && (
      <PriceModifierModal
        isOpen={isModifierModalOpen}
        onClose={() => setIsModifierModalOpen(false)}
        onSubmit={handleUpdatePrices}
        products={products}
        suppliers={suppliers}
      />
    )}
    
    {isImportModalOpen && (
      <ProductImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportProducts}
      />
    )}
  </div>
);
};

export default InventarioPage;