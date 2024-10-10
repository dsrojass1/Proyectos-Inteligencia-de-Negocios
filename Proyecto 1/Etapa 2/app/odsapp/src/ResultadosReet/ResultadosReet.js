import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";
import Plot from "react-plotly.js";
import "./ResultadosReet.css";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../assets/back.png";

function ResultadosReet() {
  const navigate = useNavigate();
  const location = useLocation();
  const { result } = location.state;

  const labels = ["ODS 3", "ODS 4", "ODS 5"];
  const confusionMatrix = result.confusion_matrix;
  const textValues = confusionMatrix.map((row) =>
    row.map((val) => val.toString())
  );

  // Estado para controlar si se muestra la explicación y si el botón está activo
  const [showExplanation, setShowExplanation] = useState(false);
  const [resetMessage, setResetMessage] = useState(""); // Nuevo estado para almacenar el mensaje del reset

  // Función para manejar el clic en "Restablecer cambios"
  const handleReset = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      setResetMessage(result.message || "Pipeline reiniciado correctamente");
    } catch (error) {
      console.error("Error al reiniciar el pipeline:", error);
      setResetMessage("Error al restablecer el pipeline");
    }
  };

  const interpretScore = (score, type) => {
    if (score >= 0.5) {
      if (type === "recall") {
        return `El recall es de ${score.toFixed(
          2
        )}, lo que significa que hay pocos falsos negativos, ya que está por encima de la mitad.`;
      } else if (type === "precision") {
        return `La precisión es de ${score.toFixed(
          2
        )}, lo que significa que hay pocos falsos positivos, ya que está por encima de la mitad.`;
      } else {
        return `El F1 score es de ${score.toFixed(
          2
        )}, lo que sugiere un buen balance entre falsos negativos y falsos positivos.`;
      }
    } else {
      if (type === "recall") {
        return `El recall es de ${score.toFixed(
          2
        )}, lo que implica que hay muchos falsos negativos, ya que está por debajo de la mitad.`;
      } else if (type === "precision") {
        return `La precisión es de ${score.toFixed(
          2
        )}, lo que indica que hay muchos falsos positivos, ya que está por debajo de la mitad.`;
      } else {
        return `El F1 score es de ${score.toFixed(
          2
        )}, lo que sugiere un mal balance entre falsos negativos y falsos positivos.`;
      }
    }
  };

  return (
    <div
      fluid
      style={{
        position: "relative",
        padding: "0",
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "flex-start",
        flexDirection: "column",
        display: "flex",
      }}
    >
      <Container className="resultados-container">
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
        <Row>
          <Col>
            <h1 className="resultados-title">RESULTADOS</h1>
          </Col>
          <Col>
            <div style={{ textAlign: "center" }}>
              <button
                className={`interpret-button ${
                  showExplanation ? "active" : ""
                }`}
                onClick={() => setShowExplanation(!showExplanation)}
              >
                ¿Cómo interpretar la matriz?
              </button>
            </div>

            {showExplanation && (
              <div className="explanation">
                <p>
                  En la matriz, las filas representan las clases reales (lo que
                  son en realidad los textos) y las columnas representan las
                  clases predichas por el modelo (lo que el modelo cree que
                  son).
                </p>

                <p>
                  Un verdadero positivo ocurre cuando el modelo predice
                  correctamente que un texto pertenece a un ODS específico.
                </p>
                <p>
                  Un falso positivo ocurre cuando el modelo predice
                  incorrectamente que un texto pertenece a un ODS, cuando en
                  realidad no pertenece a esa clase.
                </p>
                <p>
                  Un falso negativo ocurre cuando el modelo no detecta
                  correctamente que un texto pertenece a un ODS, prediciendo que
                  pertenece a otra clase.
                </p>
                <p>
                  Un verdadero negativo ocurre cuando el modelo predice
                  correctamente que un texto no pertenece a un ODS específico.
                </p>
                <p>
                  La diagonal principal nos muestra los verdaderos positivos.
                  Por ejemplo, si en la esquina superior derecha hay un 10 es
                  porque el modelo predijo correctamente 10 veces que los textos
                  pertenecían al ODS 3.
                </p>
                <p>
                  Los valores fuera de la diagonal son los errores de
                  clasificación. Por ejemplo si en la intersección del ODS 4 con
                  el 5 hay un 1 es porque el modelo predijo 1 texto como ODS 5,
                  pero en realidad era del ODS 4. FN para ODS 4 y FP para ODS 5.
                </p>
              </div>
            )}
          </Col>
        </Row>

        <Row className="confusion-matrix-container">
          <Plot
            data={[
              {
                z: confusionMatrix,
                x: labels,
                y: labels,
                type: "heatmap",
                colorscale: [
                  [0, "rgb(0, 51, 102)"], // Azul oscuro
                  [0.5, "rgb(102, 255, 178)"], // Verde claro
                  [1, "rgb(0, 153, 51)"], // Verde oscuro
                ],
                showscale: true,
                hoverongaps: false,
                text: textValues,
                texttemplate: "%{text}",
                textfont: {
                  family: "Arial",
                  size: 18,
                  color: "white",
                },
              },
            ]}
            layout={{
              title: "Confusion Matrix",
              xaxis: { title: "Predicted Label" },
              yaxis: { title: "True Label" },
              margin: { t: 50, l: 100, r: 100, b: 50 },
            }}
            style={{ width: "100%", height: "100%" }}
          />
        </Row>

        <Row>
          <Col>
            <div className="resultados-stats">
              <p>{interpretScore(result.f1_score, "f1")}</p>
              <p>{interpretScore(result.recall, "recall")}</p>
              <p>{interpretScore(result.precision, "precision")}</p>
            </div>
          </Col>
        </Row>

        <Row className="justify-content-center" style={{ textAlign: "center" }}>
          <Button className="resultados-button" onClick={handleReset}>
            Restablecer cambios
          </Button>
          {resetMessage && (
            <Row
              className="justify-content-center"
              style={{ textAlign: "center" }}
            >
              <Col>
                <p style={{ color: "black" }}>{resetMessage}</p>
              </Col>
            </Row>
          )}
        </Row>
      </Container>
    </div>
  );
}

export default ResultadosReet;
