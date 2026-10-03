import { Link, useNavigate } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext.jsx";
import { useFavoritos } from "../context/FavoritosContext.jsx";

function Header() {
  const { cantidadTotal } = useCarrito();
  const { favoritos } = useFavoritos();

  const navigate = useNavigate();

  function cambiarTema() {
    document
      .getElementById("app")
      ?.classList.toggle("modo-oscuro");
  }

  function irASeccion(seccion) {
    navigate("/");

    setTimeout(() => {
      document
        .getElementById(seccion)
        ?.scrollIntoView({
          behavior: "smooth"
        });
    }, 100);
  }

  return (
    <header className="encabezado">

      <div className="contenedor barra">

        <Link
          className="logo"
          to="/"
        >
          Bella Glow <span>Cosmetics</span>
        </Link>

        <nav className="menu">

          <Link to="/">
            Inicio
          </Link>

          <button
            type="button"
            className="enlace-menu"
            onClick={() => irASeccion("nosotros")}
          >
            Nosotros
          </button>

          <Link to="/productos">
            Productos
          </Link>

          <Link to="/favoritos">
            Favoritos ❤️
            {favoritos.length > 0 && (
              <span className="contador-favoritos">
                {favoritos.length}
              </span>
            )}
          </Link>

          <button
            type="button"
            className="enlace-menu"
            onClick={() => irASeccion("contacto")}
          >
            Contacto
          </button>

        </nav>

        <button
          className="btn-tema"
          onClick={cambiarTema}
          title="Cambiar tema"
          aria-label="Cambiar tema"
        >
          🌙
        </button>

        <button
          className="carrito-header"
          onClick={() =>
            document
              .getElementById("modal-carrito")
              ?.showModal()
          }
          title="Ver carrito"
          aria-label="Ver carrito"
        >
          🛍️ <span>{cantidadTotal}</span>
        </button>

      </div>

    </header>
  );
}

export default Header;