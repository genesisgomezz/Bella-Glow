import { Routes, Route } from "react-router-dom";

import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Carrito from "./components/Carrito.jsx";
import RutaProtegida from "./components/RutaProtegida.jsx";

import Inicio from "./pages/Inicio.jsx";
import Productos from "./pages/Productos.jsx";
import DetalleProducto from "./pages/DetalleProducto.jsx";
import Favoritos from "./pages/Favoritos.jsx";
import NoEncontrado from "./pages/NoEncontrado.jsx";

import AdministrarProductos from "./pages/AdministrarProductos.jsx";
import AdministrarUsuarios from "./pages/AdministrarUsuarios.jsx";
import AdministrarClientes from "./pages/AdministrarClientes.jsx";
import PanelAdministracion from "./pages/PanelAdministracion.jsx";

import IniciarSesion from "./pages/IniciarSesion.jsx";
import Registro from "./pages/Registro.jsx";
import MisPedidos from "./pages/MisPedidos.jsx";
import AdministrarPedidos from "./pages/AdministrarPedidos.jsx";

function App() {
  return (
    <div className="app" id="app">
      <Header />

      <Carrito />

      <Routes>
        {/* Páginas públicas */}
        <Route path="/" element={<Inicio />} />

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
          path="/iniciar-sesion"
          element={<IniciarSesion />}
        />

        <Route
          path="/registro"
          element={<Registro />}
        />

        {/* Pedidos del cliente: solo CLIENTE */}
        <Route
          element={
            <RutaProtegida rolesPermitidos={["CLIENTE"]} />
          }
        >
          <Route
            path="/mis-pedidos"
            element={<MisPedidos />}
          />
        </Route>

        {/* Administración: ADMIN y EMPLEADO */}
        <Route
          element={
            <RutaProtegida
              rolesPermitidos={["ADMIN", "EMPLEADO"]}
            />
          }
        >
          <Route
            path="/administracion"
            element={<PanelAdministracion />}
          />

          <Route
            path="/administrar-productos"
            element={<AdministrarProductos />}
          />

          <Route
            path="/administrar-pedidos"
            element={<AdministrarPedidos />}
          />
        </Route>

        {/* Gestión de personal: solo ADMIN */}
        <Route
          element={
            <RutaProtegida rolesPermitidos={["ADMIN"]} />
          }
        >
          <Route
            path="/administrar-usuarios"
            element={<AdministrarUsuarios />}
          />
        </Route>

        {/* Gestión de clientes: ADMIN y EMPLEADO */}
        <Route
          element={
            <RutaProtegida
              rolesPermitidos={["ADMIN", "EMPLEADO"]}
            />
          }
        >
          <Route
            path="/administrar-clientes"
            element={<AdministrarClientes />}
          />
        </Route>

        {/* Página no encontrada */}
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