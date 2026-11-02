
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function IniciarSesion() {
  const { iniciarSesion, cargando } = useAuth();
  const navegar = useNavigate();

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");

  async function manejarEnvio(e) {
    e.preventDefault();
    setError("");

    try {
      const usuario = await iniciarSesion(correo, contrasena);

      if (usuario.rol === "ADMIN" || usuario.rol === "EMPLEADO") {
        navegar("/administracion");
      } else {
        navegar("/");
      }
    } catch (err) {
      setError(err.message || "No se pudo iniciar sesión.");
    }
  }

  return (
    <main className="pagina-auth">
      <section className="tarjeta-auth">
        <p className="etiqueta">BIENVENIDA A BELLA GLOW</p>
        <h1>Iniciar sesión</h1>
        <p>Ingresá a tu cuenta para continuar.</p>

        {error && (
          <p className="mensaje-auth error-auth" role="alert">
            {error}
          </p>
        )}

        <form className="formulario-auth" onSubmit={manejarEnvio}>
          <label htmlFor="correo">
            Correo electrónico
            <input
              id="correo"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label htmlFor="contrasena">
            Contraseña
            <input
              id="contrasena"
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          <button className="boton" type="submit" disabled={cargando}>
            {cargando ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="auth-enlace">
          ¿Todavía no tenés cuenta?{" "}
          <Link to="/registro">Crear cuenta</Link>
        </p>

        <Link className="volver-auth" to="/">
          Volver a la tienda
        </Link>
      </section>
    </main>
  );
}

export default IniciarSesion;
