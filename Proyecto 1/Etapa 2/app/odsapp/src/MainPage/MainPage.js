import React, { useState } from "react";
import { Button, Container, Row, Col } from "react-bootstrap";
import "./MainPage.css";
import backgroundImage from "../assets/back.png";
import Caracterizacion from "../Caracterizacion/Caracterizacion";

function MainPage() {

  const [showCaracterizacion, setShowCaracterizacion] = useState(false);

  const handleShowCaracterizacion = () => {
    setShowCaracterizacion(!showCaracterizacion);
  };


  if (showCaracterizacion) {

    return <Caracterizacion />;

  
  } else {

    return (
      <Container
        fluid
        style={{
          position: "relative",
          padding: "0",
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <div md={6} className="left-side">
          <div className="content">
            <br></br>
            <br></br>
            <h1 className="title">CLASIFICACIÓN</h1>
            <h3>Objetivos de Desarrollo Sostenible</h3>
            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <p>¿Qué deseas hacer?</p>
            <Button variant="primary" className="action-button" onClick={setShowCaracterizacion}>
              Caracterizar
            </Button>
            <br></br>
            <Button variant="light" className="action-button">
              Reentrenar
            </Button>
          </div>
        </div>
        <Col md={6} className="right-side"></Col>
      </Container>
    );

  }
}

export default MainPage;
