// src/components/inventario/ProductExportModal.jsx
import React, { useState, useMemo } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { FiFileText, FiGrid, FiDownload } from 'react-icons/fi';
import { exportProductsToCSV } from '../../utils/csvHelper';
import PDFDownloadButton from '../common/PDFDownloadButton';
import InventoryReportPDF from '../pdf/InventoryReportPDF';
import { toast } from 'react-hot-toast';

const ProductExportModal = ({ isOpen, onClose, products, suppliers, businessData }) => {
  // Estados para los filtros
  const [stockStatus, setStockStatus] = useState('all');
  const [category, setCategory] = useState('');
  const [supplierId, setSupplierId] = useState('');

  // Nuevo estado para manejar la vista y los datos filtrados
  const [view, setView] = useState('filters'); // 'filters' o 'download'
  const [dataToExport, setDataToExport] = useState([]);
  const [reportTitle, setReportTitle] = useState('');

  const uniqueCategories = useMemo(() => {
    return [...new Set(products.map(p => p.category).filter(Boolean))];
  }, [products]);

  const handleGenerateReport = () => {
    // Lógica de filtrado
    let filtered = [...products];
    let title = "Reporte de Inventario Completo";
    if (stockStatus === 'all') {
      filtered = filtered.filter(p => p.stock <= (p.minStock || 0));
      title = "Reporte de Stock Crítico";
    } else if (stockStatus === 'low') {
      filtered = filtered.filter(p => p.stock > 0 && p.stock <= (p.minStock || 0));
      title = "Reporte de Productos con Stock Bajo";
    } else if (stockStatus === 'out') {
      filtered = filtered.filter(p => p.stock <= 0);
      title = "Reporte de Productos Sin Stock";
    }
    if (category) {
      filtered = filtered.filter(p => p.category === category);
    }
    if (supplierId) {
      filtered = filtered.filter(p => p.supplierId === supplierId);
    }

    if (filtered.length === 0) {
      toast.error("No se encontraron productos con esos filtros.");
      return;
    }

    setDataToExport(filtered);
    setReportTitle(title);
    setView('download'); // Cambiamos a la vista de descarga
  };

  const handleDownloadCSV = () => {
    exportProductsToCSV(dataToExport);
    onClose(); // Cierra el modal después de la descarga
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Exportar Inventario">
      {view === 'filters' ? (
        // --- VISTA 1: FILTROS ---
        <div className="export-modal-content">
          <p style={{ color: '#718096', marginTop: 0 }}>Selecciona los filtros para generar tu reporte.</p>
          <div className="input-group">
            <label>Exportar Productos:</label>
            <select value={stockStatus} onChange={(e) => setStockStatus(e.target.value)}>
              <option value="all">Stock Crítico (Bajo y Agotado)</option>
              <option value="low">Solo con Stock Bajo</option>
              <option value="out">Solo Sin Stock</option>
            </select>
          </div>
          <div className="input-group">
            <label>Filtrar por Proveedor (Opcional)</label>
            <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
              <option value="">Todos los Proveedores</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label>Filtrar por Categoría (Opcional)</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Todas las Categorías</option>
              {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="form-actions" style={{ marginTop: '30px' }}>
            <Button type="primary" onClick={handleGenerateReport}>Generar Reporte</Button>
          </div>
        </div>
      ) : (
        // --- VISTA 2: DESCARGA ---
        <div className="export-modal-content" style={{ textAlign: 'center' }}>
          <h4>Reporte Listo</h4>
          <p>Se encontraron <strong>{dataToExport.length} productos</strong>. Elige el formato de descarga.</p>
          <div className="form-actions" style={{ marginTop: '30px', justifyContent: 'space-around' }}>
            <Button type="secondary" onClick={handleDownloadCSV}>
              <FiGrid /> Descargar CSV
            </Button>
            <PDFDownloadButton
              document={<InventoryReportPDF businessData={businessData} products={dataToExport} title={reportTitle} />}
              fileName="reporte_inventario.pdf"
              className="btn primary"
            >
              <FiDownload /> Descargar PDF
            </PDFDownloadButton>
          </div>
        </div>
      )}
    </Modal>
  );
};
export default ProductExportModal;