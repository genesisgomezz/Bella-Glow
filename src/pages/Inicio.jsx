
import { useEffect, useState } from "react";
import Hero from "../components/Hero.jsx";
import ListaProductos from "../components/ListaProductos.jsx";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Inicio() {
  const { usuario, autenticado } = useAuth();

  const puedeAdministrar =
    autenticado &&
    ["ADMIN", "EMPLEADO"].includes(usuario?.rol);

  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controlador = new AbortController();

    async function obtenerProductos() {
      try {
        const respuesta = await fetch(
          "https://bella-glow-backend.onrender.com/api/productos",
          { signal: controlador.signal }
        );

        if (!respuesta.ok) {
          throw new Error(
            "No se pudieron cargar los productos de la tienda."
          );
        }

        const datos = await respuesta.json();

        if (!Array.isArray(datos)) {
          throw new Error(
            "El servidor devolvió un catálogo con formato inválido."
          );
        }

        const productosLocales = datos.map((producto) => ({
          ...producto,
          id: Number(producto.id),
          origen: "local",
        }));

        if (!controlador.signal.aborted) {
          setProductos(productosLocales);
          setError("");
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error al cargar productos:", err);
          setError(
            err.message ||
              "No pudimos cargar los productos. Verifica que el backend esté funcionando."
          );
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCargando(false);
        }
      }
    }

    obtenerProductos();

    return () => controlador.abort();
  }, []);

  return (
    <>
      <Hero />

      {puedeAdministrar && (
        <section className="seccion acceso-administracion">
          <div className="contenedor">
            <div className="tarjeta-admin-inicio">
              <div>
                <p className="etiqueta">PANEL DE CONTROL</p>
                <h2>Administración de Bella Glow</h2>
                <p>
                  Gestiona los productos, las imágenes y el catálogo
                  de la tienda desde un solo lugar.
                </p>
              </div>

              <Link
                to="/administrar-productos"
                className="boton"
              >
                Ir al panel de administración
              </Link>
            </div>
          </div>
        </section>
      )}

      <section id="nosotros" className="seccion nosotros">
        <div className="contenedor">
          <p className="etiqueta">SOBRE NOSOTROS</p>
          <h2>¿Quiénes somos?</h2>
          <p>
            Bella Glow Cosmetics es una tienda especializada en
            maquillaje, accesorios y cuidado de la piel. Nuestra
            colección busca ofrecer variedad para diferentes estilos
            y ocasiones.
          </p>
        </div>
      </section>

      {cargando ? (
        <section className="seccion">
          <div className="contenedor">
            <p role="status">
              Cargando nuestra colección...
            </p>
          </div>
        </section>
      ) : error ? (
        <section className="seccion">
          <div className="contenedor">
            <p role="alert">{error}</p>
          </div>
        </section>
      ) : (
        <ListaProductos productos={productos} />
      )}

      <section className="seccion beneficios">
        <div className="contenedor">
          <h2>¿Por qué elegir Bella Glow?</h2>

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
                Opciones para diferentes estilos y ocasiones.
              </p>
            </article>

            <article>
              <h3>Atención</h3>
              <p>
                Una experiencia sencilla para descubrir tus favoritos.
              </p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}

export default Inicio;
