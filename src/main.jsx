import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";
import { FavoritosProvider } from "./context/FavoritosContext.jsx";
import { CarritoProvider } from "./context/CarritoContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <FavoritosProvider>
      <CarritoProvider>
        <App />
      </CarritoProvider>
    </FavoritosProvider>
  </React.StrictMode>
);