// src/components/pdf/TicketPDFModal.jsx
import React from 'react';
import Modal from '../common/Modal';
import PDFDownloadButton from '../common/PDFDownloadButton';
import TicketPDF from './TicketPDF'; // La plantilla del PDF
import { FiDownload } from 'react-icons/fi';

const TicketPDFModal = ({ isOpen, onClose, businessData, saleData }) => {
  if (!saleData) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generar Ticket de Venta">
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <p>El ticket está listo para ser descargado.</p>
        <PDFDownloadButton
          document={<TicketPDF businessData={businessData} saleData={saleData} />}
          fileName={`Ticket-${saleData.id.slice(0,6)}.pdf`}
          className="btn primary"
        >
          <FiDownload /> Descargar Ticket
        </PDFDownloadButton>
      </div>
    </Modal>
  );
};
export default TicketPDFModal;