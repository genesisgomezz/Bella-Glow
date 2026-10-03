import { Link } from "react-router-dom";
import { useFavoritos } from "../context/FavoritosContext.jsx";

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

                {/* IMAGEN + CORAZÓN */}
                <div className="producto-imagen">

                  <img
                    src={producto.imagen}
                    alt={producto.nombre}
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
                  ₡{producto.precio.toLocaleString("es-CR")}
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