import React, { useState } from "react";
import { Button, Container, Row, Col } from "react-bootstrap";
import "./Caracterizacion.css";
import MainPage from "../MainPage/MainPage";
import ResultadosCaract from "../ResultadosCaract/ResultadosCaract";
import Papa from "papaparse";

function Caracterizacion() {
  const [showMain, setShowMain] = useState(false);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);

  const [modifiedCsv, setModifiedCsv] = useState(null);
  const [predictions, setPredictions] = useState([]);


  const handleShowMain = () => {
    setShowMain(!showMain);
  };

  const handleTextChange = async (e) => {
    setText(e.target.value);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmitText = async (e) => {
    e.preventDefault();
    if (text.length > 0) {
      console.log(text);
      try {
        const respuesta = await fetch('http://127.0.0.1:8000/predict', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([{ "Textos_espanol": [text] }]),
        });
        const datos = await respuesta.json();
        console.log(datos);

        setText("");

      } catch (error) {
        console.error(error);
      }
    } else {
      console.log('No se ha ingresado ningún texto');
      alert("No se ha ingresado ningún texto");
    }
  };

  const handleSubmitFile = (e) => {
    e.preventDefault();
    // Aquí puedes manejar la caracterización del archivo cargado
    if (file) {
      console.log('Archivo cargado:', file);

      Papa.parse(file, {
        header: false, // Como no tiene encabezado, lo configuramos en 'false'
        complete: function (results) {
          // Obtener los textos del CSV
          const texts = results.data.map(row => row[0]); // Obtiene la primera (y única) columna

          // Crear el formato JSON
          const jsonData = [
            {
              Textos_espanol: texts
            }
          ];

          // Enviar el JSON al API
          fetch("http://localhost:8000/predict", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(jsonData),
          })
            .then((response) => response.json())
            .then((data) => {
              console.log("Respuesta del API:", data);

              setPredictions(data.sdg);

              // Agregar la columna 'sdg' a los datos del CSV original
              const modifiedData = results.data.map((row, index) => [...row, data.sdg[index]]);

              // Agregar los encabezados de columna
              modifiedData.unshift(["Textos_espanol", "sdg"]);

              // Convertir de vuelta a CSV
              const csvWithSDG = Papa.unparse(modifiedData);

              // Guardar el CSV modificado en el estado
              setModifiedCsv(csvWithSDG);

            })
            .catch((error) => {
              console.error("Error:", error);
            });
        },
      });

    } else {
      console.log('No se ha cargado ningún archivo');
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


  if (showMain) {

    return (
      <MainPage />

    );

  } else {

    return (
      <div style={styles.container}>
        <div style={styles.box}>
          <button style={styles.buttonBack} onClick={handleShowMain}>Página principal</button>
          <h2 style={styles.title}>CARACTERIZACIÓN</h2>
          <form onSubmit={handleSubmitText}>
            <label style={styles.label}>Escribe el texto que deseas caracterizar:</label>
            <textarea
              style={styles.textarea}
              value={text}
              onChange={handleTextChange}
            />
            <button type="submit" style={styles.button}>Enviar</button>
          </form>

          <form onSubmit={handleSubmitFile} style={styles.formFile}>
            <label style={styles.label}>
              O sube un archivo CSV con una columna sin encabezados en el que cada registro coincida con una opinión a caracterizar:
            </label>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              style={styles.fileInput}
            />
            <button type="submit" style={styles.button}>Enviar</button>
          </form>

          <br />

          {modifiedCsv && (
            <button style={styles.button} onClick={handleDownload}>Descargar CSV con la caracterización</button>
          )}

          {modifiedCsv && (
            <button style={styles.button} onClick={handleDownload}>Visualizar resultados</button>

          )}

          {/* Mostrar el componente de visualización si hay predicciones */}
          {predictions.length > 0 && <ResultadosCaract predictions={predictions} />}

        </div>
      </div>
    );

  }
}



const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#4A90E2',
    overflow: 'auto',
  },
  box: {
    backgroundColor: '#4CAF50',
    padding: '20px',
    borderRadius: '10px',
    width: '70%',
    textAlign: 'center',
    overflow: 'auto',
  },
  buttonBack: {
    backgroundColor: '#ECECEC',
    border: 'none',
    padding: '10px',
    borderRadius: '20px',
    cursor: 'pointer',
    marginBottom: '20px',
  },
  title: {
    color: 'white',
    marginBottom: '20px',
  },
  label: {
    color: 'white',
    display: 'block',
    marginBottom: '10px',
  },
  textarea: {
    width: '100%',
    height: '100px',
    borderRadius: '10px',
    padding: '10px',
    border: 'none',
    marginBottom: '10px',
  },
  button: {
    backgroundColor: '#ECECEC',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '20px',
    cursor: 'pointer',
    margin: '10px',
  },
  formFile: {
    marginTop: '20px',
  },
  fileInput: {
    //   marginBottom: '10px',
    margin: '10px',
  }
};

export default Caracterizacion;
