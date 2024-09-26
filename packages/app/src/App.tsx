import { MainPage } from "./pages/MainPage";
import "../index.css";
import { Providers } from "./Providers";

const App = () => {
  return (
    <Providers>
      <MainPage />
    </Providers>
  );
};

export default App;
