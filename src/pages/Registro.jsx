import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Registro() {
  const { registrarse, cargando } = useAuth();
  const navegar = useNavigate();

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  async function manejarEnvio(e) {
    e.preventDefault();
    setMensaje("");
    setError("");

    if (contrasena !== confirmacion) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (contrasena.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    try {
      const resultado = await registrarse(nombre, correo, contrasena);

      setMensaje(
        resultado.mensaje || "Cuenta creada correctamente."
      );

      setTimeout(() => navegar("/iniciar-sesion"), 1800);
    } catch (err) {
      setError(err.message || "No se pudo crear la cuenta.");
    }
  }

  return (
    <main className="pagina-auth">
      <section className="tarjeta-auth">
        <p className="etiqueta">TU EXPERIENCIA BELLA GLOW</p>
        <h1>Crear cuenta</h1>
        <p>Registrate para disfrutar de nuestra tienda.</p>

        {error && (
          <p className="mensaje-auth error-auth" role="alert">
            {error}
          </p>
        )}

        {mensaje && (
          <p className="mensaje-auth exito-auth" role="status">
            {mensaje}
          </p>
        )}

        <form className="formulario-auth" onSubmit={manejarEnvio}>
          <label htmlFor="nombre">
            Nombre completo
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              maxLength={150}
              autoComplete="name"
              required
            />
          </label>

          <label htmlFor="correo-registro">
            Correo electrónico
            <input
              id="correo-registro"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              maxLength={150}
              autoComplete="email"
              required
            />
          </label>

          <label htmlFor="contrasena-registro">
            Contraseña
            <input
              id="contrasena-registro"
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              minLength={8}
              maxLength={72}
              autoComplete="new-password"
              required
            />
          </label>

          <label htmlFor="confirmacion">
            Confirmar contraseña
            <input
              id="confirmacion"
              type="password"
              value={confirmacion}
              onChange={(e) => setConfirmacion(e.target.value)}
              autoComplete="new-password"
              required
            />
          </label>

          <button
            className="boton"
            type="submit"
            disabled={cargando}
          >
            {cargando ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="auth-enlace">
          ¿Ya tenés cuenta?{" "}
          <Link to="/iniciar-sesion">Iniciar sesión</Link>
        </p>

        <Link className="volver-auth" to="/">
          Volver a la tienda
        </Link>
      </section>
    </main>
  );
}

export default Registro;
