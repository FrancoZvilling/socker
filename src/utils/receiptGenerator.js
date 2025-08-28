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