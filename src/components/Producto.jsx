import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFavoritos } from "../context/FavoritosContext.jsx";
import { useCarrito } from "../context/CarritoContext.jsx";

function Producto({
  id,
  nombre,
  categoria,
  descripcion,
  imagen,
  precio
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
    precio
  };

  function mostrarAviso(mensaje) {
    setAviso(mensaje);

    setTimeout(() => {
      setAviso("");
    }, 1800);
  }

  function agregar() {
    agregarAlCarrito(producto);

    mostrarAviso(
      `✓ ${nombre} agregado al carrito`
    );
  }

  function favorito() {
    toggleFavorito(producto);

    if (favoritoActivo) {
      mostrarAviso(
        `♡ ${nombre} eliminado de favoritos`
      );
    } else {
      mostrarAviso(
        `♥ ${nombre} agregado a favoritos`
      );
    }
  }

  function verProducto() {
    navigate(`/productos/${id}`);
  }

  return (
    <article
      className="tarjeta producto"
      data-categoria={categoria.toLowerCase()}
      data-nombre={nombre.toLowerCase()}
    >

      <div className="producto-imagen">

        <img
          src={imagen}
          alt={nombre}
        />

        <button
          type="button"
          className={`favorito ${
            favoritoActivo ? "activo" : ""
          }`}
          onClick={favorito}
          aria-label={`Favorito ${nombre}`}
        >
          {favoritoActivo ? "♥" : "♡"}
        </button>

      </div>

      <span className="categoria-mini">
        {categoria}
      </span>

      <h3>
        {nombre}
      </h3>

      <p>
        {descripcion}
      </p>

      <strong>
        ₡{precio.toLocaleString("es-CR")}
      </strong>

      <div className="acciones">

        <button
          type="button"
          className="boton secundario"
          onClick={verProducto}
        >
          Ver producto
        </button>

        <button
          type="button"
          className="boton"
          onClick={agregar}
        >
          🛍️ Agregar
        </button>

      </div>

      {aviso && (
        <div
          className="aviso visible"
          role="status"
          aria-live="polite"
        >
          {aviso}
        </div>
      )}

    </article>
  );
}

export default Producto;