// src/components/pdf/RemitoPDFModal.jsx
import React from 'react';
import Modal from '../common/Modal';
import PDFDownloadButton from '../common/PDFDownloadButton';
import RemitoPDF from './RemitoPDF'; // La plantilla del PDF
import { FiDownload } from 'react-icons/fi';

const RemitoPDFModal = ({ isOpen, onClose, businessData, saleData }) => {
  if (!saleData) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generar Remito">
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <p>El remito está listo para ser descargado.</p>
        <PDFDownloadButton
          document={<RemitoPDF businessData={businessData} saleData={saleData} />}
          fileName={`Remito-${saleData.id.slice(0,6)}.pdf`}
          className="btn primary"
        >
          <FiDownload /> Descargar Remito
        </PDFDownloadButton>
      </div>
    </Modal>
  );
};
export default RemitoPDFModal;