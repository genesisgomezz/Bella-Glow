
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFavoritos } from "../context/FavoritosContext.jsx";
import { useCarrito } from "../context/CarritoContext.jsx";

const API_BASE = "http://localhost:3000";

function obtenerUrlImagen(imagen) {
  if (!imagen) return "/img/productos.svg";

  // Las imágenes subidas se sirven desde Express.
  if (imagen.startsWith("/uploads/")) {
    return `${API_BASE}${imagen}`;
  }

  // Conserva las imágenes locales y las URLs externas.
  return imagen;
}

function formatearPrecio(precio, origen) {
  const cantidad = Number(precio);

  if (!Number.isFinite(cantidad)) {
    return "Precio no disponible";
  }

  if (origen === "externo") {
    return cantidad.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  }

  return `₡${cantidad.toLocaleString("es-CR", {
    maximumFractionDigits: 0,
  })}`;
}

function Producto({
  id,
  nombre,
  categoria,
  descripcion,
  imagen,
  precio,
  origen = "local",
}) {
  const { toggleFavorito, esFavorito } = useFavoritos();
  const { agregarAlCarrito } = useCarrito();

  const [aviso, setAviso] = useState("");
  const navigate = useNavigate();

  const favoritoActivo = esFavorito(id);

  const producto = {
    id,
    nombre,
    categoria,
    descripcion,
    imagen,
    precio,
    origen,
  };

  function mostrarAviso(mensaje) {
    setAviso(mensaje);

    setTimeout(() => {
      setAviso("");
    }, 1800);
  }

  function agregar() {
    agregarAlCarrito(producto);
    mostrarAviso(`✓ ${nombre} agregado al carrito`);
  }

  function favorito() {
    toggleFavorito(producto);

    if (favoritoActivo) {
      mostrarAviso(`♡ ${nombre} eliminado de favoritos`);
    } else {
      mostrarAviso(`♥ ${nombre} agregado a favoritos`);
    }
  }

  function verProducto() {
    navigate(`/productos/${id}`);
  }

  return (
    <article
      className="tarjeta producto"
      data-categoria={(categoria || "").toLowerCase()}
      data-nombre={(nombre || "").toLowerCase()}
    >
      <div className="producto-imagen">
        <img
          src={obtenerUrlImagen(imagen)}
          alt={nombre}
          onError={(evento) => {
            evento.currentTarget.onerror = null;
            evento.currentTarget.src = "/img/productos.svg";
          }}
        />

        <button
          type="button"
          className={`favorito ${favoritoActivo ? "activo" : ""}`}
          onClick={favorito}
          aria-label={`Favorito ${nombre}`}
        >
          {favoritoActivo ? "♥" : "♡"}
        </button>
      </div>

      <span className="categoria-mini">{categoria}</span>

      <h3>{nombre}</h3>

      <p>{descripcion}</p>

      <strong>{formatearPrecio(precio, origen)}</strong>

      <div className="acciones">
        <button
          type="button"
          className="boton secundario"
          onClick={verProducto}
        >
          Ver producto
        </button>

        <button type="button" className="boton" onClick={agregar}>
          🛍️ Agregar
        </button>
      </div>

      {aviso && (
        <div className="aviso visible" role="status" aria-live="polite">
          {aviso}
        </div>
      )}
    </article>
  );
}

export default Producto;
