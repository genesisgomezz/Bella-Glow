import Hero from "../components/Hero.jsx";
import ListaProductos from "../components/ListaProductos.jsx";
import ProductosAPI from "../components/ProductosAPI.jsx";
import { productos } from "../data/productos.js";

function Inicio() {
  return (
    <>
      <Hero />

      <section
        id="nosotros"
        className="seccion nosotros"
      >
        <div className="contenedor">

          <p className="etiqueta">
            SOBRE NOSOTROS
          </p>

          <h2>¿Quiénes somos?</h2>

          <p>
            Bella Glow Cosmetics es una tienda
            especializada en maquillaje, accesorios
            y cuidado de la piel. Nuestra colección
            busca ofrecer variedad para diferentes
            estilos y ocasiones.
          </p>

        </div>
      </section>

      <ListaProductos productos={productos} />

      <ProductosAPI />

      <section className="seccion beneficios">
        <div className="contenedor">

          <h2>
            ¿Por qué elegir Bella Glow?
          </h2>

          <div className="grid-beneficios">

            <article>
              <h3>Calidad</h3>
              <p>
                Productos cuidadosamente seleccionados.
              </p>
            </article>

            <article>
              <h3>Variedad</h3>
              <p>
                Opciones para diferentes estilos y
                ocasiones.
              </p>
            </article>

            <article>
              <h3>Atención</h3>
              <p>
                Una experiencia sencilla para descubrir
                tus favoritos.
              </p>
            </article>

          </div>

        </div>
      </section>
    </>
  );
}

export default Inicio;