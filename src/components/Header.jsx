import { useCarrito } from "../context/CarritoContext.jsx";

function Header() {
  const { cantidadTotal } = useCarrito();

  function cambiarTema() {
    document
      .getElementById("app")
      ?.classList.toggle("modo-oscuro");
  }

  return (
    <header className="encabezado">
      <div className="contenedor barra">

        <a className="logo" href="#inicio">
          Bella Glow <span>Cosmetics</span>
        </a>

        <nav className="menu">
          <a href="#inicio">Inicio</a>
          <a href="#nosotros">Nosotros</a>
          <a href="#productos">Productos</a>
          <a href="#contacto">Contacto</a>
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
          document.getElementById("modal-carrito")?.showModal()
        }
        title="Ver carrito"
        aria-label="Ver carrito"
        >🛍️ <span>{cantidadTotal}</span>
        </button>

      </div>
    </header>
  );
} export default Header;