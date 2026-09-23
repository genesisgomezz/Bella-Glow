import { useState } from "react";
import Producto from "./Producto.jsx";

const categorias = [
  "Todos",
  "Labios",
  "Rostro",
  "Ojos",
  "Paletas",
  "Rubor",
  "Iluminadores",
  "Brochas",
  "Skincare"
];

function ListaProductos({ productos }) {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");

  const productosFiltrados = productos.filter((producto) => {
    const coincideCategoria =
      categoriaSeleccionada === "Todos" ||
      producto.categoria === categoriaSeleccionada;

    const coincideBusqueda =
      producto.nombre.toLowerCase().includes(busqueda.toLowerCase());

    return coincideCategoria && coincideBusqueda;
  });

  function cerrarModal() {
    document.getElementById("modal-producto")?.close();
  }

  return (
    <section id="productos" className="seccion">
      <div className="contenedor">

        <p className="etiqueta">NUESTRA COLECCIÓN</p>

        <h2>Encuentra tus nuevos favoritos ♡</h2>

        <div className="catalogo-herramientas">

          <label className="buscador">
            🔎

            <input
              type="search"
              placeholder="Buscar producto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </label>

          <div className="filtros">
            {categorias.map((categoria) => (
              <button
                key={categoria}
                className={`filtro ${
                  categoriaSeleccionada === categoria ? "activo" : ""
                }`}
                onClick={() => setCategoriaSeleccionada(categoria)}
              >
                {categoria}
              </button>
            ))}
          </div>

        </div>

        <div className="grid-productos">

          {productosFiltrados.length > 0 ? (
            productosFiltrados.map((producto) => (
              <Producto
                key={producto.id}
                {...producto}
              />
            ))
          ) : (
            <p className="sin-resultados">
              No se encontraron productos.
            </p>
          )}

        </div>

        <div
          id="aviso"
          className="aviso"
          aria-live="polite"
        ></div>

        <dialog
          id="modal-producto"
          className="modal"
        >
          <button
            className="cerrar"
            onClick={cerrarModal}
            aria-label="Cerrar"
          >
            ×
          </button>

          <img
            id="modal-img"
            src="/img/productos.svg"
            alt="Producto"
          />

          <span
            id="modal-cat"
            className="categoria-mini"
          ></span>

          <h3 id="modal-nombre"></h3>

          <p id="modal-desc"></p>

          <strong id="modal-precio"></strong>
        </dialog>

      </div>
    </section>
  );
}

export default ListaProductos;