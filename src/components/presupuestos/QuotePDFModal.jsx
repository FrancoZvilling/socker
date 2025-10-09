// src/components/presupuestos/QuotePDFModal.jsx
import React, { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import PDFDownloadButton from '../common/PDFDownloadButton'; // Reutilizamos nuestro botón
import QuotePDF from '../pdf/QuotePDF'; // La plantilla del PDF
import { FiDownload } from 'react-icons/fi';

const QuotePDFModal = ({ isOpen, onClose, businessData, quoteData }) => {
  const [validityDays, setValidityDays] = useState(quoteData.validityDays || 15);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generar PDF del Presupuesto">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Input 
          label="Validez del Presupuesto (en días)"
          type="number"
          value={validityDays}
          onChange={(e) => setValidityDays(e.target.value)}
        />
        <div style={{ textAlign: 'center' }}>
          {/* El botón de descarga ahora vive aquí y se renderiza solo cuando es necesario */}
          <PDFDownloadButton
            document={<QuotePDF businessData={businessData} quoteData={quoteData} validityDays={validityDays} />}
            fileName={`Presupuesto-${quoteData.id.slice(0,6)}.pdf`}
            // Hacemos que el botón se vea como un botón normal
            className="btn primary" 
          >
            <FiDownload /> Descargar PDF
          </PDFDownloadButton>
        </div>
      </div>
    </Modal>
  );
};
export default QuotePDFModal;