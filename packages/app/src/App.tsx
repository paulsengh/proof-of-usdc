import { MainPage } from "./pages/MainPage";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { useLocation } from "react-use";
import styled from "styled-components";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route element={<>Not found</>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
