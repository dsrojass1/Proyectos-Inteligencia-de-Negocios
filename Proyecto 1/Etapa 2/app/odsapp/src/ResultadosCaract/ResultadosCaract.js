import React, { useState } from "react";
import { Button, Container, Row, Col } from "react-bootstrap";
import "./ResultadosCaract.css";
import MainPage from "../MainPage/MainPage";
import Papa from "papaparse";

import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ResultadosCaract = ({ predictions }) => {
  
  // Preparar los datos para la gráfica
  const dataForChart = {
    labels: predictions.map((_, index) => `Instancia ${index + 1}`), // Etiquetas para cada instancia
    datasets: [{
      label: 'Resultado de Predicción (SDG)',
      data: predictions, // Los valores de SDG obtenidos
      backgroundColor: 'rgba(	74, 144, 226, 0.7)',
      borderColor: 'rgba(	74, 144, 226, 1)',
      borderWidth: 1,
    }]
  };

  return (
    <div>
      <h3>Gráfico de Predicciones por Instancia</h3>
      <div className="div_grafico">
      <Bar
        data={dataForChart}
        options={{
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'SDG'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Instancias'
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Gráfico de SDG Predichos por Instancia'
            }
          }
        }}
      />
      </div>
    </div>
  );
};

export default ResultadosCaract;