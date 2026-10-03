import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles.css";
import { FavoritosProvider } from "./context/FavoritosContext.jsx";
import { CarritoProvider } from "./context/CarritoContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <FavoritosProvider>
        <CarritoProvider>
          <App />
        </CarritoProvider>
      </FavoritosProvider>
    </BrowserRouter>
  </React.StrictMode>
);