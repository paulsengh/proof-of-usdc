import React from "react";
import { MainPage } from "./pages/MainPage";
import "../index.css";
import Providers from "./Providers";

const App: React.FC = () => {
  return (
    <Providers>
      <MainPage />
    </Providers>
  );
};

export default App;
