// src/components/dashboard/TopProductsChart.jsx
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TopProductsChart = ({ topProductsData }) => {
  const options = {
    indexAxis: 'y', // <-- ESTO HACE QUE EL GRÁFICO SEA HORIZONTAL
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      x: { // Ahora el eje X es el de los números
        beginAtZero: true,
        ticks: {
          precision: 0, // No mostrar decimales para cantidades
        }
      }
    }
  };

  const data = {
    // Los nombres de los productos van en el eje Y
    labels: topProductsData?.map(p => p.name) || [],
    datasets: [
      {
        label: 'Cantidad Vendida',
        // Las cantidades vendidas van en el eje X
        data: topProductsData?.map(p => p.quantity) || [],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
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

export default TopProductsChart;