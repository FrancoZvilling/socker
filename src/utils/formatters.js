// src/utils/formatters.js

/**
 * Formatea un número como moneda en el formato argentino (ARS).
 * Ejemplo: formatCurrency(12345.67) => "$ 12.345,67"
 * @param {number} number El número a formatear.
 * @returns {string} El número formateado como una cadena de texto.
 */
export const formatCurrency = (number) => {
  // Si el valor no es un número, devolvemos un valor por defecto para evitar errores.
  if (typeof number !== 'number') {
    return '$ 0,00';
  }

  // Intl.NumberFormat es el "motor" de formato de JavaScript.
  // 'es-AR' le dice que use las convenciones de Argentina (punto para miles, coma para decimales).
  const formatter = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS', // Especificamos que es el Peso Argentino
    minimumFractionDigits: 2, // Siempre mostrar dos decimales
  });

  return formatter.format(number);
};

/**
 * Calcula la diferencia en días entre una fecha pasada y hoy.
 * @param {Date} pastDate - La fecha del pasado (debe ser un objeto Date).
 * @returns {number} El número de días transcurridos.
 */
export const daysSince = (pastDate) => {
  const today = new Date();
  // Reseteamos las horas para comparar solo las fechas
  today.setHours(0, 0, 0, 0);
  pastDate.setHours(0, 0, 0, 0);

  const differenceInTime = today.getTime() - pastDate.getTime();
  const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
  
  return differenceInDays;
};