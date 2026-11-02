
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCarrito } from "../context/CarritoContext.jsx";

const API_BASE = "http://localhost:3000";

function formatearColones(precio) {
  return `₡${Number(precio).toLocaleString("es-CR", {
    maximumFractionDigits: 0,
  })}`;
}

function obtenerUrlImagen(imagen) {
  if (!imagen) return "/img/productos.svg";

  if (imagen.startsWith("/uploads/")) {
    return `${API_BASE}${imagen}`;
  }

  return imagen;
}

function DetalleProducto() {
  const { id } = useParams();
  const { agregarAlCarrito } = useCarrito();

  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const controlador = new AbortController();

    async function cargarProducto() {
      setCargando(true);
      setError("");
      setProducto(null);

      try {
        const respuesta = await fetch(
          `${API_BASE}/api/productos`,
          { signal: controlador.signal }
        );

        if (!respuesta.ok) {
          throw new Error("No se pudo consultar el catálogo.");
        }

        const productos = await respuesta.json();

        const encontrado = productos.find(
          (item) => String(item.id) === String(id)
        );

        if (!encontrado) {
          setError("Producto no encontrado.");
          return;
        }

        setProducto({
          ...encontrado,
          origen: "local",
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(
            "No se pudo cargar el producto. Comprueba tu conexión e inténtalo nuevamente."
          );
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCargando(false);
        }
      }
    }

    cargarProducto();

    return () => controlador.abort();
  }, [id]);

  function agregar() {
    if (!producto || Number(producto.stock) <= 0) return;

    agregarAlCarrito(producto);
    setMensaje(`${producto.nombre} agregado al carrito.`);
  }

  if (cargando) {
    return (
      <main className="seccion">
        <div className="contenedor">
          <p>Cargando producto...</p>
        </div>
      </main>
    );
  }

  if (error || !producto) {
    return (
      <main className="seccion">
        <div className="contenedor">
          <p className="etiqueta">BELLA GLOW COSMETICS</p>
          <h1>Producto no encontrado</h1>
          {error && <p role="alert">{error}</p>}

          <Link to="/productos" className="boton">
            Volver al catálogo
          </Link>
        </div>
      </main>
    );
  }

  const sinStock = Number(producto.stock) <= 0;

  return (
    <main className="detalle-producto">
      <div className="contenedor">
        <Link to="/productos" className="volver">
          ← Volver al catálogo
        </Link>

        <div className="detalle-producto-contenido">
          <div className="detalle-producto-imagen">
            <img
              src={obtenerUrlImagen(producto.imagen)}
              alt={producto.nombre}
              onError={(evento) => {
                evento.currentTarget.onerror = null;
                evento.currentTarget.src = "/img/productos.svg";
              }}
            />
          </div>

          <div className="detalle-producto-info">
            <span className="categoria-mini">
              {producto.categoria}
            </span>

            <h1>{producto.nombre}</h1>

            <p className="detalle-descripcion">
              {producto.descripcion}
            </p>

            <p className="detalle-precio">
              {formatearColones(producto.precio)}
            </p>

            <p>
              {sinStock
                ? "Producto agotado"
                : `Disponibles: ${producto.stock} unidades`}
            </p>

            <button
              type="button"
              className="boton"
              onClick={agregar}
              disabled={sinStock}
            >
              {sinStock
                ? "Sin existencias"
                : "🛍️ Agregar al carrito"}
            </button>

            {mensaje && (
              <p role="status" aria-live="polite">
                ✓ {mensaje}
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default DetalleProducto;
