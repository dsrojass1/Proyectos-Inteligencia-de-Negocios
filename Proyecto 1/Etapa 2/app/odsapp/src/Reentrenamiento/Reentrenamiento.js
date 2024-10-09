import React, { useState } from "react";
import { Button, Container, Row, Col, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse"; // Librería para parsear CSV
import "./Reentrenamiento.css";

function Reentrenamiento() {
  const [file, setFile] = useState(null);
  const [jsonData, setJsonData] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false); // Nuevo estado para mensaje de éxito
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
          text,
          ods,
        }));
        setJsonData(jsonResult);
        setUploadSuccess(true); // Cambia a verdadero cuando se sube correctamente
      },
      header: false, // Asegurarse de que no hay encabezados en el CSV
      skipEmptyLines: true,
    });
  };

  const handleSubmit = () => {
    if (jsonData) {
      console.log("Datos en JSON:", jsonData);
      // Aquí puedes manejar la lógica para enviar el JSON al servidor
    }
  };

  return (
    <div className="app-container">
      <Container className="reen-container">
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
        <Row className="align-items-center" style={{ alignItems: "center" }}>
          <Col sm={8} style={{ textAlign: "center" }}>
            <p>
              Sube un archivo csv con dos columnas sin encabezado, una que
              contenga el texto y la otra con el ODS al que corresponde.
            </p>
          </Col>
          <br></br>
          <Col sm={4} className="text-center" style={{ textAlign: "center" }}>
            <Form.Group>
              <Form.Label className="upload-label" htmlFor="fileUpload">
                <Button id="bb" htmlFor="fileUpload">
                  Cargar archivo
                </Button>
              </Form.Label>
              <Form.Control
                type="file"
                id="fileUpload"
                onChange={handleFileChange}
                style={{ display: "none" }} // Ocultar el input
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Mensaje de éxito */}
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
        <Row className="justify-content-center" style={{ textAlign: "center" }}>
          <Button
            id="bb"
            variant="light"
            className="submit-button"
            onClick={handleSubmit}
          >
            Enviar
          </Button>
        </Row>
      </Container>
    </div>
  );
}

export default Reentrenamiento;
