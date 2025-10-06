// src/utils/receiptGenerator.js

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from './formatters';

export const generateReceiptPDF = (businessData, saleData) => {
  // 1. Crear una nueva instancia de jsPDF (sin cambios)
  const doc = new jsPDF('p', 'mm', 'a4');

  // 2. Definir fuentes y tamaños (sin cambios)
  const pageWidth = doc.internal.pageSize.getWidth();
  const center = pageWidth / 2;

  // --- Encabezado del Ticket (sin cambios) ---
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(businessData?.name || 'Mi Negocio', center, 20, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Comprobante de Venta No Válido como Factura', center, 28, { align: 'center' });
  doc.setLineWidth(0.5);
  doc.line(10, 32, pageWidth - 10, 32);

  // --- Información de la Venta (sin cambios) ---
  let startY = 40;
  doc.setFontSize(12);
  doc.text(`Fecha: ${saleData.createdAt.toDate().toLocaleString()}`, 15, startY);
  doc.text(`Venta ID: ${saleData.id}`, pageWidth - 15, startY, { align: 'right' });
  startY += 7;
  if (saleData.client) {
    doc.text(`Cliente: ${saleData.client.name}`, 15, startY);
    startY += 7;
  }
  startY += 5;

  // --- Tabla de Productos (sin cambios) ---
  const head = [['Cant.', 'Producto', 'P. Unit.', 'Subtotal']];
  const body = saleData.items.map(item => [
    item.quantity,
    item.name,
    formatCurrency(item.price),
    formatCurrency(item.price * item.quantity)
  ]);

  autoTable(doc, {
    startY: startY,
    head: head,
    body: body,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] },
    styles: { halign: 'center' },
    columnStyles: {
      1: { halign: 'left' },
      2: { halign: 'right' },
      3: { halign: 'right' },
    },
  });

  // --- Total (Sección Corregida) ---
  let finalY = (doc.lastAutoTable.finalY || startY + 10) + 15;
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');

  const rightMargin = 15;
  const rightAlignX = pageWidth - rightMargin;

  // Se alinea la etiqueta "TOTAL:" a la derecha, pero con un desplazamiento
  doc.text('TOTAL:', rightAlignX - 35, finalY, { align: 'right' });
  // Se alinea el monto al borde derecho
  doc.text(formatCurrency(saleData.total), rightAlignX, finalY, { align: 'right' });
  
  // --- Pie de Página (sin cambios) ---
  finalY += 20;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text('¡Gracias por su compra!', center, finalY, { align: 'center' });

  // 3. Abrir el PDF (sin cambios)
  doc.output('dataurlnewwindow');
};

export const generateDeliveryNotePDF = (businessData, saleData) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const center = pageWidth / 2;

  // --- Encabezado del Remito ---
  // Intentamos añadir el logo si existe la URL
  if (businessData?.businessLogoUrl) {
    try {
      // Nota: Esto puede fallar si hay problemas de CORS con la imagen.
      // Si falla, simplemente imprimirá el texto.
      doc.addImage(businessData.businessLogoUrl, 'PNG', 15, 15, 40, 20);
    } catch(e) {
      console.error("Error al cargar el logo en el PDF:", e);
      // Si falla la imagen, imprimimos el nombre del negocio como plan B
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text(businessData.name, center, 20, { align: 'center' });
    }
  } else {
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text(businessData?.name || 'Mi Negocio', center, 20, { align: 'center' });
  }

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('REMITO', center, 40, { align: 'center' });

  doc.setLineWidth(0.5);
  doc.line(10, 45, pageWidth - 10, 45);

  // --- Información de la Venta (sin precios) ---
  let startY = 55;
  doc.setFontSize(12);
  doc.text(`Fecha: ${saleData.createdAt.toDate().toLocaleString()}`, 15, startY);
  doc.text(`Venta ID: ${saleData.id}`, pageWidth - 15, startY, { align: 'right' });
  startY += 7;
  if (saleData.client) {
    doc.text(`Cliente: ${saleData.client.name}`, 15, startY);
    startY += 7;
  }
  startY += 5;

  // --- Tabla de Productos (SIN PRECIOS) ---
  const head = [['Cantidad', 'Código/SKU', 'Descripción del Producto']];
  const body = saleData.items.map(item => [
    item.quantity,
    item.sku || 'N/A', // Usamos el SKU si existe
    item.name
  ]);

  autoTable(doc, {
    startY: startY,
    head: head,
    body: body,
    theme: 'grid', // 'grid' se ve más como un documento formal
    headStyles: { fillColor: [100, 100, 100] },
    columnStyles: {
      0: { halign: 'center' },
      2: { halign: 'left' },
    },
  });

  // --- Pie de Página para Firma ---
  let finalY = doc.lastAutoTable.finalY + 20;
  doc.setFontSize(12);
  doc.text('Recibí conforme:', 15, finalY);
  doc.line(50, finalY, 120, finalY); // Línea para la firma
  doc.text('Aclaración:', 15, finalY + 10);
  doc.line(45, finalY + 10, 120, finalY + 10); // Línea para la aclaración

  doc.output('dataurlnewwindow');
};

export const generateQuotePDF = (businessData, quoteData) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const center = pageWidth / 2;

  // --- Encabezado ---
  if (businessData?.businessLogoUrl) {
    try {
      doc.addImage(businessData.businessLogoUrl, 'PNG', 15, 15, 40, 20, '', 'FAST');
    } catch(e) {
      console.error("Error al cargar el logo en el PDF:", e);
      doc.setFontSize(22).setFont('helvetica', 'bold').text(businessData.name, center, 20, { align: 'center' });
    }
  } else {
      doc.setFontSize(22).setFont('helvetica', 'bold').text(businessData?.name || 'Mi Negocio', center, 20, { align: 'center' });
  }
  
  doc.setFontSize(18).setFont('helvetica', 'bold').text('PRESUPUESTO', center, 40, { align: 'center' });
  doc.setLineWidth(0.5).line(10, 45, pageWidth - 10, 45);

  // --- Información ---
  let startY = 55;
  doc.setFontSize(12);
  doc.text(`Fecha: ${quoteData.createdAt.toDate().toLocaleString()}`, 15, startY);
  doc.text(`Presupuesto Nº: ${quoteData.id.slice(0, 8).toUpperCase()}`, pageWidth - 15, startY, { align: 'right' });
  startY += 7;
  if (quoteData.client) {
    doc.text(`Cliente: ${quoteData.client.name}`, 15, startY);
    startY += 7;
  }
  startY += 5;

  // --- Tabla de Ítems (CON PRECIOS) ---
  const head = [['Cant.', 'Descripción', 'P. Unit.', 'Subtotal']];
  const body = quoteData.items.map(item => [
    item.quantity,
    item.name,
    formatCurrency(item.price),
    formatCurrency(item.price * item.quantity)
  ]);

  autoTable(doc, {
    startY,
    head,
    body,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] },
    styles: { halign: 'center' },
    columnStyles: {
      1: { halign: 'left' },
      2: { halign: 'right' },
      3: { halign: 'right' },
    },
  });

  // --- Total ---
  let finalY = doc.lastAutoTable.finalY + 20;
  doc.setFontSize(20).setFont('helvetica', 'bold');
  doc.text('TOTAL:', pageWidth - 70, finalY, { align: 'right' });
  doc.text(formatCurrency(quoteData.total), pageWidth - 15, finalY, { align: 'right' });

  // --- Pie de Página (Validez) ---
  finalY += 15;
  doc.setFontSize(10).setFont('helvetica', 'italic');
  doc.text('Presupuesto válido por 15 días.', center, finalY, { align: 'center' });

  doc.output('dataurlnewwindow');
};