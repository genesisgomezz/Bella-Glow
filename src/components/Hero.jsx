function Hero() {
  return (
    <section id="inicio" className="hero">
      <div className="contenedor hero-contenido">

        <div>
          <p className="etiqueta">
            BELLA GLOW COSMETICS
          </p>

          <h1>
            Descubre el maquillaje perfecto para cada ocasión
          </h1>

          <p>
            Productos de maquillaje y accesorios para crear looks naturales,
            elegantes y modernos.
          </p>

          <div className="hero-botones">
            <a
              className="boton"
              href="#productos"
            >
              Ver productos
            </a>

            <a
              className="boton secundario"
              href="#nosotros"
            >
              Conócenos
            </a>
          </div>
        </div>

        <img
          src="/img/hero-maquillaje.svg"
          alt="Productos de maquillaje Bella Glow"
        />

      </div>
    </section>
  );
}

export default Hero;