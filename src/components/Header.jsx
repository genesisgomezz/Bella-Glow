import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext.jsx";
import { useFavoritos } from "../context/FavoritosContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function Header() {
  const { cantidadTotal } = useCarrito();
  const { favoritos } = useFavoritos();
  const { usuario, autenticado, cerrarSesion } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const ocultarCarrito =
    location.pathname === "/iniciar-sesion" ||
    location.pathname === "/registro";

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
          behavior: "smooth",
        });
    }, 100);
  }

  function manejarCierreSesion() {
    cerrarSesion();
    navigate("/");
  }

  return (
    <header className="encabezado">
      <div className="contenedor barra">
        <Link className="logo" to="/">
          Bella Glow <span>Cosmetics</span>
        </Link>

        <nav className="menu">
          <Link to="/">Inicio</Link>

          <button
            type="button"
            className="enlace-menu"
            onClick={() => irASeccion("nosotros")}
          >
            Nosotros
          </button>

          <Link to="/productos">Productos</Link>

          <Link to="/favoritos">
            Favoritos ❤️
            {favoritos.length > 0 && (
              <span className="contador-favoritos">
                {favoritos.length}
              </span>
            )}
          </Link>

          {autenticado && usuario?.rol === "CLIENTE" && (
            <Link to="/mis-pedidos">
              Mis pedidos
            </Link>
          )}

          <button
            type="button"
            className="enlace-menu"
            onClick={() => irASeccion("contacto")}
          >
            Contacto
          </button>
        </nav>

        <div className="acciones-cuenta">
          {autenticado ? (
            <>
              <span className="saludo-usuario">
                Hola, {usuario.nombre}
              </span>

              {(usuario.rol === "ADMIN" ||
                usuario.rol === "EMPLEADO") && (
                <Link
                  className="enlace-cuenta"
                  to="/administracion"
                >
                  Administrar
                </Link>
              )}

              <button
                type="button"
                className="enlace-cuenta boton-cerrar-sesion"
                onClick={manejarCierreSesion}
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link
                className="enlace-cuenta"
                to="/iniciar-sesion"
              >
                Iniciar sesión
              </Link>

              <Link
                className="enlace-cuenta"
                to="/registro"
              >
                Crear cuenta
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="btn-tema"
          onClick={cambiarTema}
          title="Cambiar tema"
          aria-label="Cambiar tema"
        >
          🌙
        </button>

        {!ocultarCarrito && (
          <button
            type="button"
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
        )}
      </div>
    </header>
  );
}

export default Header;