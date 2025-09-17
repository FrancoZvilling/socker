import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Registramos los elementos específicos para un gráfico de LÍNEAS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const MonthlySalesChart = ({ monthlySalesData }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
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

  const data = {
    labels: monthlySalesData?.map(d => d.month) || [], // Eje X: '2025-08', '2025-09'
    datasets: [
      {
        label: 'Ventas Mensuales',
        data: monthlySalesData?.map(d => d.total) || [], // Eje Y: El total de ventas
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.2, // Esto le da una leve curvatura a la línea
      },
    ],
  };

  return (
    <div style={{ height: '300px' }}>
      <Line options={options} data={data} />
    </div>
  );
};

export default MonthlySalesChart;