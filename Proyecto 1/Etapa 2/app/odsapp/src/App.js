import "./App.css";
import MainPage from "./MainPage/MainPage";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Reentrenamiento from "./Reentrenamiento/Reentrenamiento";
import ResultadosReet from "./ResultadosReet/ResultadosReet";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/reentrenamiento" element={<Reentrenamiento />} />
          <Route path="/resultadosReent" element={<ResultadosReet />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
