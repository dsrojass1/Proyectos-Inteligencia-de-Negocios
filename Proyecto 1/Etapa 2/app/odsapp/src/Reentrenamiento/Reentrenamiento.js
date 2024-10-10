import React, { useState } from "react";
import { Button, Container, Row, Col, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse"; // Librería para parsear CSV
import "./Reentrenamiento.css";

function Reentrenamiento() {
  const [file, setFile] = useState(null);
  const [jsonData, setJsonData] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false); // Nuevo estado para mensaje de éxito
  const [loading, setLoading] = useState(false); // Estado de carga
  const navigate = useNavigate();

  // Manejar la carga del archivo CSV
  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);

    // Parsear el archivo CSV a JSON usando PapaParse
    Papa.parse(uploadedFile, {
      complete: (result) => {
        // Convertimos el CSV en un objeto JSON
        const jsonResult = result.data.map(([text, ods]) => ({
          Textos_espanol: text,
          sdg: parseInt(ods), // Asegurar que 'sdg' sea un número
        }));
        setJsonData(jsonResult);
        setUploadSuccess(true); // Cambia a verdadero cuando se sube correctamente
      },
      header: false, // Asegurarse de que no hay encabezados en el CSV
      skipEmptyLines: true,
    });
  };

  // Función para abrir el input de archivo al hacer clic en el botón
  const openFileDialog = () => {
    document.getElementById("fileUpload").click();
  };

  // Enviar el JSON al endpoint de reentrenamiento
  const handleSubmit = async () => {
    if (jsonData) {
      setLoading(true); // Mostrar estado de carga
      try {
        const response = await fetch("http://127.0.0.1:8000/retrain", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Textos_espanol: jsonData.map((item) => item.Textos_espanol),
            sdg: jsonData.map((item) => item.sdg),
          }),
        });
        const result = await response.json();
        setLoading(false); // Detener estado de carga
        navigate("/resultadosReent", { state: { result } }); // Redirigir a la página de resultados con los datos
      } catch (error) {
        console.error("Error durante el reentrenamiento:", error);
        setLoading(false);
      }
    }
  };

  return (
    <div className="app-container" style={{ alignContent: "center" }}>
      <Container className="reen-container" style={{ alignContent: "center" }}>
        {loading ? (
          <div
            style={{
              color: "white",
              padding: "20px",
              textAlign: "center",
            }}
          >
            <h3>Cargando...</h3>
          </div>
        ) : (
          <>
            <Row>
              <Col className="text-left">
                <Button
                  id="bb"
                  variant="light"
                  className="back-button"
                  onClick={() => navigate("/")}
                >
                  Página principal
                </Button>
              </Col>
            </Row>
            <Row className="justify-content-center">
              <h1>REENTRENAMIENTO</h1>
            </Row>
            <br></br>
            <Row
              className="align-items-center"
              style={{ alignItems: "center" }}
            >
              <Col sm={8} style={{ textAlign: "center" }}>
                <p>
                  Sube un archivo csv con dos columnas sin encabezado, una que
                  contenga el texto y la otra con el ODS al que corresponde.
                </p>
              </Col>
              <br></br>
              <Col
                sm={4}
                className="text-center"
                style={{ textAlign: "center" }}
              >
                <Form.Group>
                  <Button id="bb" onClick={openFileDialog}>
                    Cargar archivo
                  </Button>
                  <Form.Control
                    type="file"
                    id="fileUpload"
                    onChange={handleFileChange}
                    style={{ display: "none" }} // Ocultar el input
                  />
                </Form.Group>
              </Col>
            </Row>

            {uploadSuccess && (
              <Row className="justify-content-center">
                <Col sm={12}>
                  <p style={{ color: "white", textAlign: "center" }}>
                    Archivo cargado y convertido a JSON con éxito.
                  </p>
                </Col>
              </Row>
            )}
            <br></br>
            <Row
              className="justify-content-center"
              style={{ textAlign: "center" }}
            >
              <Button
                id="bb"
                variant="light"
                className="submit-button"
                onClick={handleSubmit}
              >
                Enviar
              </Button>
            </Row>
          </>
        )}
      </Container>
    </div>
  );
}

export default Reentrenamiento;
