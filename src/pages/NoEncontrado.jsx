import { Link } from "react-router-dom";

function NoEncontrado() {
  return (
    <main className="seccion pagina-no-encontrado">
      <div className="contenedor">

        <p className="etiqueta">
          BELLA GLOW COSMETICS
        </p>

        <h1>404</h1>

        <h2>Página no encontrada</h2>

        <p>
          Lo sentimos, la página que buscas no existe.
        </p>

        <Link to="/" className="boton">
          Volver al inicio
        </Link>

      </div>
    </main>
  );
}

export default NoEncontrado;