// src/utils/csvHelper.js

import Papa from 'papaparse';
import { toast } from 'react-hot-toast';

const CSV_HEADERS = [
  "name",
  "sku",
  "category",
  "stock",
  "costPrice",
  "price",
  "minStock"
];

export const downloadCSVTemplate = () => {
  // 1. Creamos la cabecera del CSV y una fila de ejemplo.
  const headerString = CSV_HEADERS.join(';');
  const exampleRow = "Ej: Alfajor Triple;12345;Golosinas;100;800;1500;20";
  
  // 2. Creamos el contenido.
  const csvContent = `${headerString}\n${exampleRow}`;
  
  // 3. (La Magia) Añadimos un 'BOM' (Byte Order Mark) al principio del archivo.
  
  const bom = "\uFEFF";
  
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // El resto de la lógica de descarga no cambia
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "plantilla_productos.csv");
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Convierte un array de objetos de producto a un archivo CSV y lo descarga.
 * @param {Array<Object>} products - La lista de productos a exportar.
 */
export const exportProductsToCSV = (products) => {
  if (!products || products.length === 0) {
    // Usamos toast en lugar de alert para consistencia
    toast.error("No hay productos para exportar.");
    return;
  }

  // Añadimos el objeto de configuración a 'unparse'
  const csv = Papa.unparse(products, {
    delimiter: ";", // Le decimos explícitamente que use punto y coma
    header: true,
    columns: ["name", "sku", "category", "stock", "minStock", "costPrice", "price", "supplierName"]
  });
  

  // Añadimos el BOM para máxima compatibilidad con Excel
  const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
  
  // El resto de la lógica de descarga no cambia
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", "reporte_inventario.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};