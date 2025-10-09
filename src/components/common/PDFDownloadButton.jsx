// src/components/common/PDFDownloadButton.jsx
import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { FiLoader } from 'react-icons/fi';

// Este componente ahora es más flexible.
// - Si le pasas 'children', renderiza un botón con el texto/íconos que le pases.
// - Si no, renderiza el 'icon-button' por defecto.
const PDFDownloadButton = ({ document, fileName, icon, title, className, children }) => {

  // Si se pasan 'children', se renderiza un enlace estilizado.
  if (children) {
    return (
      // Le pasamos el 'className' al enlace para que se vea como un botón
      <PDFDownloadLink document={document} fileName={fileName} className={className}>
        {({ loading }) => (loading ? (
          // Mostramos un estado de carga genérico
          <>
            <FiLoader className="spinner-icon" /> Generando PDF...
          </>
        ) : (
          // Mostramos el contenido que nos pasaron
          children
        ))}
      </PDFDownloadLink>
    );
  }

  // Comportamiento por defecto: renderizar solo el botón de ícono
  return (
    <PDFDownloadLink document={document} fileName={fileName}>
      {({ blob, url, loading, error }) => 
        loading ? (
          <button className="icon-button" title="Generando PDF..." disabled>
            <FiLoader className="spinner-icon" />
          </button>
        ) : (
          <button className="icon-button" title={title}>
            {icon}
          </button>
        )
      }
    </PDFDownloadLink>
  );
};

export default PDFDownloadButton;