
import { useEffect, useState } from "react";
import ListaProductos from "../components/ListaProductos.jsx";

function Productos() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const obtenerProductos = async () => {
      try {
        const respuesta = await fetch("http://localhost:3000/api/productos");

        if (!respuesta.ok) {
          throw new Error("No se pudieron cargar los productos.");
        }

        const datos = await respuesta.json();
        setProductos(datos);
      } catch (err) {
        console.error("Error al cargar los productos:", err);
        setError(
          "No pudimos cargar los productos. Verifica que el backend esté funcionando."
        );
      } finally {
        setCargando(false);
      }
    };

    obtenerProductos();
  }, []);

  return (
    <main className="seccion pagina-productos">
      <div className="contenedor">
        <p className="etiqueta">BELLA GLOW COSMETICS</p>

        <h1>Catálogo de productos</h1>

        <p>
          Explora nuestra colección de maquillaje,
          accesorios y productos para el cuidado de la piel.
        </p>

        {cargando ? (
          <p role="status">Cargando productos...</p>
        ) : error ? (
          <p role="alert">{error}</p>
        ) : (
          <ListaProductos productos={productos} />
        )}
      </div>
    </main>
  );
}

export default Productos;
