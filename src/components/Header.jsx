function Header() {
  function cambiarTema(){ document.getElementById('app')?.classList.toggle('modo-oscuro'); }
  return <header className="encabezado"><div className="contenedor barra">
    <a className="logo" href="#inicio">Bella Glow <span>Cosmetics</span></a>
    <nav className="menu"><a href="#inicio">Inicio</a><a href="#nosotros">Nosotros</a><a href="#productos">Productos</a><a href="#contacto">Contacto</a></nav>
    <button className="btn-tema" onClick={cambiarTema} title="Cambiar tema" aria-label="Cambiar tema">🌙</button>
    <div className="carrito-header" title="Demostración de evento">🛍️ <span id="contador-carrito">0</span></div>
  </div></header>;
}
export default Header;
