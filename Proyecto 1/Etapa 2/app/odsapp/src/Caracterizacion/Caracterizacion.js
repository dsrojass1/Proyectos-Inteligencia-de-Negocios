import React, { useState } from "react";
import { Button, Container, Row, Col } from "react-bootstrap";
import "./Caracterizacion.css";
import MainPage from "../MainPage/MainPage";

function Caracterizacion() {
    const [showMain, setShowMain] = useState(false);
    const [text, setText] = useState("");
    const [file, setFile] = useState(null);


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
      } else {
        console.log('No se ha cargado ningún archivo');
        alert('No se ha cargado ningún archivo');
      }
    };

    if (showMain) {
  
    return(
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
    },
    box: {
      backgroundColor: '#4CAF50',
      padding: '20px',
      borderRadius: '10px',
      width: '70%',
      textAlign: 'center',
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
      marginTop: '10px',
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
