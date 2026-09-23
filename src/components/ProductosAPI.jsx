import { useEffect, useState } from "react";

function ProductosAPI() {
  const [productosAPI, setProductosAPI] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("https://dummyjson.com/products/category/beauty?limit=4")
      .then((respuesta) => {
        if (!respuesta.ok) {
          throw new Error("No se pudieron cargar los productos");
        }

        return respuesta.json();
      })
      .then((datos) => {
        setProductosAPI(datos.products);
        setCargando(false);
      })
      .catch(() => {
        setError("No se pudieron cargar las recomendaciones.");
        setCargando(false);
      });
  }, []);

  return (
    <section className="seccion">
      <div className="contenedor">

        <p className="etiqueta">DESCUBRE MÁS</p>

        <h2>También te puede interesar</h2>
        
        {cargando && (
            <div className="estado-api">
                <span className="cargando-api">⏳</span>
                <p>Cargando recomendaciones...</p>
                </div>
            )}
            
            {error && (
                <div className="estado-api error-api">
                    <span>⚠️</span>
                    <p>{error}</p>
                    </div>
                )}

        {!cargando && !error && (
          <div className="grid-productos">

            {productosAPI.map((producto) => (
              <article
                className="tarjeta producto"
                key={producto.id}
              >

                <div className="producto-imagen">
                  <img
                    src={producto.thumbnail}
                    alt={producto.title}
                  />
                </div>

                <span className="categoria-mini">
                  Belleza
                </span>

                <h3>{producto.title}</h3>

                <p>{producto.description}</p>

                <strong>
                  ${producto.price.toFixed(2)}
                </strong>

              </article>
            ))}

          </div>
        )}

      </div>
    </section>
  );
}

export default ProductosAPI;