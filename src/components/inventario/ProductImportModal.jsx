// src/components/inventario/ProductImportModal.jsx
import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { downloadCSVTemplate } from '../../utils/csvHelper'; 
import Papa from 'papaparse';
import { FiDownload, FiUpload } from 'react-icons/fi';
import './ProductImportModal.css'; 

const ProductImportModal = ({ isOpen, onClose, onImport }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setError('');
    setParsedData([]);
    if (!file) {
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError('El archivo CSV parece tener un formato incorrecto. Por favor, revisa la plantilla.');
        }
        setParsedData(results.data);
      },
      error: () => {
        setError('No se pudo leer el archivo. Asegúrate de que sea un CSV válido.');
      }
    });
  };

  const handleImport = () => {
    if (parsedData.length > 0) {
      onImport(parsedData);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Importar Productos desde CSV">
      <div className="import-modal-content">
        <div className="step">
          <h4>Paso 1: Descargar la Plantilla</h4>
          <p>Usa nuestra plantilla para asegurar que tus datos tengan el formato correcto. El único campo obligatorio es 'name'.</p>
          <Button onClick={downloadCSVTemplate} type="secondary">
            <FiDownload /> Descargar Plantilla.csv
          </Button>
        </div>

        <div className="step">
          <h4>Paso 2: Subir tu Archivo</h4>
          <p>Selecciona el archivo CSV que rellenaste.</p>
          <input type="file" accept=".csv" onChange={handleFileChange} />
          {error && <p className="error-message">{error}</p>}
        </div>

        {parsedData.length > 0 && !error && (
          <div className="step">
            <h4>Paso 3: Vista Previa y Confirmación</h4>
            <p>Se encontraron <strong>{parsedData.length} productos</strong>. Revisa que las primeras filas sean correctas.</p>
            {/* Aquí podríamos añadir una tabla de vista previa si quisiéramos */}
            <Button onClick={handleImport} type="primary">
              <FiUpload /> Confirmar e Importar {parsedData.length} Productos
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ProductImportModal;