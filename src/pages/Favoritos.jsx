import { Link } from "react-router-dom";
import { useFavoritos } from "../context/FavoritosContext.jsx";

const API_BASE = "https://bella-glow-backend.onrender.com";

function obtenerUrlImagen(imagen) {
  if (!imagen) return "/img/productos.svg";
  if (imagen.startsWith("/uploads/")) return `${API_BASE}${imagen}`;
  return imagen;
}

function formatearPrecio(precio) {
  const valor = Number(precio);
  return Number.isFinite(valor)
    ? `₡${valor.toLocaleString("es-CR", { maximumFractionDigits: 0 })}`
    : "Precio no disponible";
}

function Favoritos() {
  const { favoritos, toggleFavorito } = useFavoritos();

  return (
    <main className="seccion pagina-favoritos">
      <div className="contenedor">

        <p className="etiqueta">BELLA GLOW COSMETICS</p>

        <h1 className="titulo-favoritos">
          Mis favoritos ❤️
        </h1>

        {favoritos.length === 0 ? (
          <div className="favoritos-vacio">
            <h2>Aún no tienes favoritos</h2>

            <p>
              Explora nuestros productos y agrega tus favoritos
              para encontrarlos aquí.
            </p>

            <Link to="/productos" className="boton">
              Explorar productos
            </Link>
          </div>
        ) : (
          <div className="grid-productos">

            {favoritos.map((producto) => (
              <article
                className="tarjeta producto"
                key={producto.id}
              >

                <div className="producto-imagen">

                  <img
                    src={obtenerUrlImagen(producto.imagen)}
                    alt={producto.nombre}
                    onError={(evento) => {
                      evento.currentTarget.onerror = null;
                      evento.currentTarget.src = "/img/productos.svg";
                    }}
                  />

                  <button
                    type="button"
                    className="favorito activo"
                    onClick={() => toggleFavorito(producto)}
                    aria-label={`Quitar ${producto.nombre} de favoritos`}
                  >
                    ♥
                  </button>

                </div>

                <span className="categoria-mini">
                  {producto.categoria}
                </span>

                <h3>{producto.nombre}</h3>

                <p>{producto.descripcion}</p>

                <strong>
                  {formatearPrecio(producto.precio)}
                </strong>

                <div className="acciones">

                  <Link
                    to={`/productos/${producto.id}`}
                    className="boton secundario"
                  >
                    Ver producto
                  </Link>

                </div>

              </article>
            ))}

          </div>
        )}

      </div>
    </main>
  );
}

export default Favoritos;