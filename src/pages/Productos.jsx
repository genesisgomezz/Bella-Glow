import ListaProductos from "../components/ListaProductos.jsx";
import { productos } from "../data/productos.js";

function Productos() {
  return (
    <main className="seccion pagina-productos">
      <div className="contenedor">

        <p className="etiqueta">
          BELLA GLOW COSMETICS
        </p>

        <h1>Catálogo de productos</h1>

        <p>
          Explora nuestra colección de maquillaje,
          accesorios y productos para el cuidado de la piel.
        </p>

        <ListaProductos productos={productos} />

      </div>
    </main>
  );
}

export default Productos;