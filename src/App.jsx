import { Routes, Route } from "react-router-dom";

import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Carrito from "./components/Carrito.jsx";

import Inicio from "./pages/Inicio.jsx";
import Productos from "./pages/Productos.jsx";
import DetalleProducto from "./pages/DetalleProducto.jsx";
import Favoritos from "./pages/Favoritos.jsx";
import NoEncontrado from "./pages/NoEncontrado.jsx";

function App() {
  return (
    <div className="app" id="app">

      <Header />

      <Carrito />

      <Routes>

        <Route
          path="/"
          element={<Inicio />}
        />

        <Route
          path="/productos"
          element={<Productos />}
        />

        <Route
          path="/productos/:id"
          element={<DetalleProducto />}
        />

        <Route
          path="/favoritos"
          element={<Favoritos />}
        />

        <Route
          path="*"
          element={<NoEncontrado />}
        />

      </Routes>

      <Footer />

    </div>
  );
}

export default App;