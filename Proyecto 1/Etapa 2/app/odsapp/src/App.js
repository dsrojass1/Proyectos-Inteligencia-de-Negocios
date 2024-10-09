import "./App.css";
import MainPage from "./MainPage/MainPage";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Reentrenamiento from "./Reentrenamiento/Reentrenamiento";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/reentrenamiento" element={<Reentrenamiento />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
