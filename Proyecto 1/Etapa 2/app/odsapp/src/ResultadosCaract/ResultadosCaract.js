import React from "react";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import "./ResultadosCaract.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ResultadosCaract = ({ predictions, probabilities, texts }) => {

  const dataForChart = {
    labels: predictions.map((_, index) => `Instancia ${index + 1}`), 
    datasets: [{
      label: 'Resultado de Predicción (SDG)',
      data: predictions, 
      backgroundColor: 'rgba(74, 144, 226, 0.7)',
      borderColor: 'rgba(74, 144, 226, 1)',
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

      <h3>Tabla de Resultados</h3>
      <div className="table-container">
        <table className="result-table">
          <thead>
            <tr>
              <th>Texto</th>
              <th>SDG Predicho</th>
              <th>Probabilidades</th>
            </tr>
          </thead>
          <tbody>
            {texts.map((text, index) => (
              <tr key={index}>
                <td>{text}</td>
                <td>{predictions[index]}</td>
                <td>
                  {probabilities[index]
                    .map((prob, i) => `Clase ${i + 1}: ${(prob * 100).toFixed(2)}%`)
                    .join(', ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultadosCaract;
