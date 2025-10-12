// src/components/common/PDFDownloadButton.jsx
import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { FiLoader } from 'react-icons/fi';

const PDFDownloadButton = ({ document, fileName, icon, title, children, className }) => {
  return (
    <PDFDownloadLink document={document} fileName={fileName} className={className}>
      {({ loading, error }) => {
        // Si hay un error durante la generación, lo mostramos en la consola
        if (error) {
          console.error("Error al renderizar el PDF:", error);
        }
        
        // Mientras carga, mostramos el estado de carga
        if (loading) {
          if (icon) { // Para botones de icono
            return (
              <button className="icon-button" title="Generando PDF..." disabled>
                <FiLoader className="spinner-icon" />
              </button>
            );
          }
          return 'Generando...'; // Para botones de texto
        }

        // Si no está cargando y no hay error, mostramos el contenido
        if (children) {
          return children; // Para el enlace oculto o botones de texto
        }
        
        // Comportamiento por defecto para los botones de icono en tablas
        return (
          <button className="icon-button" title={title}>
            {icon}
          </button>
        );
      }}
    </PDFDownloadLink>
  );
};

export default PDFDownloadButton;