import React, { useState } from "react";
import Papa from "papaparse";
import MainPage from "../MainPage/MainPage";
import ResultadosCaract from "../ResultadosCaract/ResultadosCaract";
import "./Caracterizacion.css";

function Caracterizacion() {

  const [showMain, setShowMain] = useState(false);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);

  const [modifiedCsv, setModifiedCsv] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [showGraph, setShowGraph] = useState(false);
  const [responseReceived, setResponseReceived] = useState(false);

  const handleShowMain = () => {
    setShowMain(!showMain);
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmitText = async (e) => {
    e.preventDefault();
    if (text.length > 0) {
      const lines = text.split('\n').filter(line => line.trim() !== "");

      if (lines.length > 0) {
        const jsonData = [
          {
            Textos_espanol: lines
          }
        ];

        try {
          const respuesta = await fetch('http://127.0.0.1:8000/predict', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonData),
          });
          const datos = await respuesta.json();
          console.log(datos);

          // Generar CSV a partir del texto y las predicciones recibidas
          const modifiedData = lines.map((line, index) => [line, datos.sdg[index]]);
          modifiedData.unshift(["Textos_espanol", "sdg"]);
          const csvWithSDG = Papa.unparse(modifiedData);

          setModifiedCsv(csvWithSDG);

          setText("");
          setPredictions(datos.sdg); 
          setResponseReceived(true); 

        } catch (error) {
          console.error(error);
        }
      }
    } else {
      console.log('No se ha ingresado ningún texto');
      alert("No se ha ingresado ningún texto");
    }
  };

  const handleSubmitFile = (e) => {
    e.preventDefault();
    if (file) {
      console.log('Archivo cargado:', file);

      Papa.parse(file, {
        delimiter: ";",
        header: false, // Como no tiene encabezado, lo configuramos en 'false'
        complete: function (results) {
          const texts = results.data.map(row => row[0]);

          const jsonData = [
            {
              Textos_espanol: texts
            }
          ];

          fetch("http://localhost:8000/predict", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(jsonData),
          })
            .then((response) => response.json())
            .then((data) => {
              setPredictions(data.sdg);
              const modifiedData = results.data.map((row, index) => [...row, data.sdg[index]]);
              modifiedData.unshift(["Textos_espanol", "sdg"]);
              const csvWithSDG = Papa.unparse(modifiedData);
              setModifiedCsv(csvWithSDG);
              setResponseReceived(true); 

            })
            .catch((error) => {
              console.error("Error:", error);
            });
        },
      });

    } else {
      alert('No se ha cargado ningún archivo');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([modifiedCsv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "archivo_con_sdg.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShowGraph = () => {
    setShowGraph(!showGraph);
    setResponseReceived(false);
  };

  if (showMain) {
    return <MainPage />;
  } else if (!showMain && !showGraph) {
    return (
      <div className="container">
        <div className="box">
          <button className="button" onClick={handleShowMain}>Página principal</button>
          <h2 className="title">CARACTERIZACIÓN</h2>
          <form onSubmit={handleSubmitText}>
            <label className="label">Escribe el texto que deseas caracterizar:</label>
            <textarea
              className="textarea"
              value={text}
              onChange={handleTextChange}
              placeholder="Escribe cada opinión en una nueva línea..."
            />
            <br />
            <button type="submit" className="button">Enviar</button>
          </form>

          <form onSubmit={handleSubmitFile} className="form-file">
            <label className="label">
              O sube un archivo CSV con una columna sin encabezados en el que cada fila coincida con una opinión a caracterizar:
            </label>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="file-input"
            />
            <button type="submit" className="button">Enviar</button>
          </form>

          <br />

          {responseReceived && (
            <button className="button" onClick={handleDownload}>Descargar CSV con la caracterización</button>
          )}

          {responseReceived && (
            <button className="button" onClick={handleShowGraph}>Visualizar resultados</button>
          )}

        </div>
      </div>
    );
  } else if (!showMain && showGraph) {
    return (
      <div className="container">
        <div className="box">
          <button className="button" onClick={handleShowMain}>Página principal</button>
          <button className="button" onClick={handleShowGraph}>Realizar otra caracterización</button>
          <button className="button" onClick={handleDownload}>Descargar CSV con la caracterización</button>
          <h2 className="title">VISUALIZACIÓN DE LA CARACTERIZACIÓN</h2>
          {predictions.length > 0 && <ResultadosCaract predictions={predictions} />}
        </div>
      </div>
    );
  }
}

export default Caracterizacion;

