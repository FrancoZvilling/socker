// src/components/dashboard/WeeklySalesChart.jsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Registramos los componentes de Chart.js (sin cambios)
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Se cambia el nombre del prop de 'salesData' a 'chartData' para mayor claridad
const WeeklySalesChart = ({ chartData }) => {
  // Opciones de configuración para el gráfico (sin cambios)
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + new Intl.NumberFormat('es-AR').format(value);
          }
        }
      }
    }
  };

  // Se preparan los datos para el gráfico usando los props recibidos
  const data = {
    // Se usan las etiquetas (labels) que vienen de 'chartData'.
    // '|| []' es una guarda de seguridad por si los datos aún no han llegado.
    labels: chartData?.labels || [],
    datasets: [
      {
        label: 'Ventas',
        // Se usan los valores (data) que vienen de 'chartData'.
        data: chartData?.data || [],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={{ height: '300px' }}>
      <Bar options={options} data={data} />
    </div>
  );
};

export default WeeklySalesChart;