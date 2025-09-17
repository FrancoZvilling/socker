// src/components/dashboard/ChartsCarousel.jsx
import React from 'react';
import Slider from 'react-slick';
import WeeklySalesChart from './WeeklySalesChart';
import TopProductsChart from './TopProductsChart';
import MonthlySalesChart from './MonthlySalesChart'; // Se importa el componente para el tercer gráfico

import "slick-carousel/slick/slick-theme.css"; 
import "slick-carousel/slick/slick.css"; 

import './ChartsCarousel.css';

// El componente ahora recibe también 'monthlySalesData'
const ChartsCarousel = ({ weeklyChartData, topProductsData, monthlySalesData }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
  };

  return (
    <div className="charts-carousel-container">
      <Slider {...settings}>
        {/* Primera diapositiva (sin cambios) */}
        <div className="chart-slide">
          <h3>Ventas de la Última Semana</h3>
          <WeeklySalesChart chartData={weeklyChartData} />
        </div>
        
        {/* Segunda diapositiva (sin cambios) */}
        <div className="chart-slide">
          <h3>Top 5 Productos Vendidos (Últimos 30 días)</h3>
          <TopProductsChart topProductsData={topProductsData} />
        </div>
        
        {/* Tercera diapositiva ahora muestra el gráfico de Ventas Mensuales */}
        <div className="chart-slide">
          <h3>Tendencia de Ventas (Últimos 12 meses)</h3>
          <MonthlySalesChart monthlySalesData={monthlySalesData} />
        </div>
      </Slider>
    </div>
  );
};

export default ChartsCarousel;