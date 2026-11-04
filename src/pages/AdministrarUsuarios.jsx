import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

const API_AUTH = "https://bella-glow-backend.onrender.com/api/auth";

function AdministrarUsuarios() {
  const { token, usuario } = useAuth();

  const [formulario, setFormulario] = useState({
    nombre: "",
    correo: "",
    contrasena: "",
    rol: "EMPLEADO",
  });

  const [personal, setPersonal] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [usuarioProcesando, setUsuarioProcesando] = useState(null);
  const [usuarioConfirmacion, setUsuarioConfirmacion] = useState(null);

  const cargarPersonal = useCallback(async () => {
    setCargando(true);
    setError("");

    try {
      const respuesta = await fetch(`${API_AUTH}/personal`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.mensaje || "No se pudo cargar el personal."
        );
      }

      setPersonal(Array.isArray(resultado) ? resultado : []);
    } catch (err) {
      setError(err.message || "Error al cargar el personal.");
    } finally {
      setCargando(false);
    }
  }, [token]);

  useEffect(() => {
    cargarPersonal();
  }, [cargarPersonal]);

  const personalFiltrado = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    return personal.filter((persona) => {
      const coincideBusqueda =
        String(persona.nombre || "").toLowerCase().includes(termino) ||
        String(persona.correo || "").toLowerCase().includes(termino);

      const activo = Number(persona.estado) === 1;

      const coincideEstado =
        filtroEstado === "todos" ||
        (filtroEstado === "activos" && activo) ||
        (filtroEstado === "inactivos" && !activo);

      return coincideBusqueda && coincideEstado;
    });
  }, [personal, busqueda, filtroEstado]);

  function manejarCambio(evento) {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  async function crearPersonal(evento) {
    evento.preventDefault();
    setMensaje("");
    setError("");
    setGuardando(true);

    try {
      const respuesta = await fetch(`${API_AUTH}/crear-personal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formulario),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.mensaje || "No se pudo crear la cuenta."
        );
      }

      setMensaje(
        `Cuenta creada para ${resultado.usuario.nombre}.`
      );

      setFormulario({
        nombre: "",
        correo: "",
        contrasena: "",
        rol: "EMPLEADO",
      });

      await cargarPersonal();
    } catch (err) {
      setError(err.message || "Ocurrió un error al crear la cuenta.");
    } finally {
      setGuardando(false);
    }
  }

  function solicitarCambioEstado(persona) {
    setMensaje("");
    setError("");
    setUsuarioConfirmacion(persona);
  }

  function cancelarCambioEstado() {
    if (usuarioProcesando !== null) return;
    setUsuarioConfirmacion(null);
  }

  async function cambiarEstado() {
    if (!usuarioConfirmacion) return;

    const persona = usuarioConfirmacion;
    const estadoActual = Number(persona.estado) === 1;
    const nuevoEstado = estadoActual ? 0 : 1;

    setMensaje("");
    setError("");
    setUsuarioProcesando(persona.id);

    try {
      const respuesta = await fetch(
        `${API_AUTH}/personal/${persona.id}/estado`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            estado: nuevoEstado,
          }),
        }
      );

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.mensaje || "No se pudo actualizar la cuenta."
        );
      }

      setMensaje(resultado.mensaje);
      setUsuarioConfirmacion(null);

      await cargarPersonal();
    } catch (err) {
      setError(err.message || "Error al cambiar el estado.");
    } finally {
      setUsuarioProcesando(null);
    }
  }

  const esReactivacion =
    usuarioConfirmacion &&
    Number(usuarioConfirmacion.estado) !== 1;

  return (
    <main className="seccion pagina-admin-usuarios">
      <div className="contenedor">
        <p className="etiqueta">BELLA GLOW COSMETICS</p>

        <h1>Administrar personal</h1>

        <p className="panel-descripcion">
          Crea cuentas y gestiona el acceso del personal de la tienda.
        </p>

        {mensaje && (
          <p className="mensaje-admin" role="status">
            {mensaje}
          </p>
        )}

        {error && (
          <p className="error-admin" role="alert">
            {error}
          </p>
        )}

        {/* CONFIRMACIÓN INTEGRADA */}
        {usuarioConfirmacion && (
          <div
            className="confirmacion-fondo"
            onMouseDown={(evento) => {
              if (evento.target === evento.currentTarget) {
                cancelarCambioEstado();
              }
            }}
          >
            <section
              className="confirmacion-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="titulo-confirmacion"
              aria-describedby="descripcion-confirmacion"
            >
              <div className="confirmacion-icono">
                {esReactivacion ? "💗" : "⚠️"}
              </div>

              <h2 id="titulo-confirmacion">
                {esReactivacion
                  ? "Reactivar cuenta"
                  : "Desactivar cuenta"}
              </h2>

              <p id="descripcion-confirmacion">
                ¿Deseas{" "}
                <strong>
                  {esReactivacion ? "reactivar" : "desactivar"}
                </strong>{" "}
                la cuenta de{" "}
                <strong>{usuarioConfirmacion.nombre}</strong>?
              </p>

              <p className="confirmacion-ayuda">
                {esReactivacion
                  ? "La persona podrá volver a iniciar sesión con su cuenta."
                  : "La persona no podrá iniciar sesión mientras su cuenta esté inactiva."}
              </p>

              <div className="confirmacion-acciones">
                <button
                  type="button"
                  className="confirmacion-cancelar"
                  onClick={cancelarCambioEstado}
                  disabled={usuarioProcesando !== null}
                >
                  Volver
                </button>

                <button
                  type="button"
                  className="confirmacion-aceptar"
                  onClick={cambiarEstado}
                  disabled={usuarioProcesando !== null}
                >
                  {usuarioProcesando !== null
                    ? "Procesando..."
                    : "Sí, continuar"}
                </button>
              </div>
            </section>
          </div>
        )}

        {/* FORMULARIO PARA CREAR PERSONAL */}
        <section className="seccion-formulario-personal">
          <div className="encabezado-seccion-admin">
            <span className="admin-icono">👤</span>

            <div>
              <h2>Crear nueva cuenta</h2>
              <p>Registra un empleado o administrador.</p>
            </div>
          </div>

          <form
            className="formulario-admin-personal"
            onSubmit={crearPersonal}
          >
            <label>
              Nombre completo *
              <input
                name="nombre"
                value={formulario.nombre}
                onChange={manejarCambio}
                maxLength={150}
                placeholder="Ej. María López Vargas"
                autoComplete="name"
                required
              />
            </label>

            <label>
              Correo electrónico *
              <input
                name="correo"
                type="email"
                value={formulario.correo}
                onChange={manejarCambio}
                maxLength={150}
                placeholder="usuario@correo.com"
                autoComplete="email"
                required
              />
            </label>

            <label>
              Contraseña inicial *
              <input
                name="contrasena"
                type="password"
                value={formulario.contrasena}
                onChange={manejarCambio}
                minLength={8}
                maxLength={72}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                required
              />
            </label>

            <label>
              Tipo de cuenta *
              <select
                name="rol"
                value={formulario.rol}
                onChange={manejarCambio}
                required
              >
                <option value="EMPLEADO">Empleado</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </label>

            <button type="submit" disabled={guardando}>
              {guardando ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>
        </section>

        {/* TABLA DE PERSONAL */}
        <section className="seccion-tabla-personal">
          <div className="encabezado-seccion-admin">
            <span className="admin-icono">👥</span>

            <div>
              <h2>Personal registrado</h2>
              <p>Administra las cuentas y sus estados.</p>
            </div>
          </div>

          <div className="herramientas-personal">
            <input
              type="search"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
              placeholder="Buscar por nombre o correo..."
              aria-label="Buscar personal"
            />

            <select
              value={filtroEstado}
              onChange={(evento) => setFiltroEstado(evento.target.value)}
              aria-label="Filtrar por estado"
            >
              <option value="todos">Todos los estados</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
            </select>
          </div>

          {cargando ? (
            <p role="status">Cargando personal...</p>
          ) : personalFiltrado.length === 0 ? (
            <p>No se encontraron cuentas con esos criterios.</p>
          ) : (
            <div className="tabla-personal-contenedor">
              <table className="tabla-personal">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Correo electrónico</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {personalFiltrado.map((persona) => {
                    const activo = Number(persona.estado) === 1;

                    const esMiCuenta =
                      Number(persona.id) === Number(usuario?.id);

                    return (
                      <tr key={persona.id}>
                        <td>{persona.nombre}</td>

                        <td>{persona.correo}</td>

                        <td>
                          <span
                            className={`rol-personal rol-${String(
                              persona.rol
                            ).toLowerCase()}`}
                          >
                            {persona.rol}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`estado-personal ${
                              activo
                                ? "estado-activo"
                                : "estado-inactivo"
                            }`}
                          >
                            {activo ? "● Activo" : "● Inactivo"}
                          </span>
                        </td>

                        <td>
                          {esMiCuenta ? (
                            <span className="cuenta-propia">
                              Tu cuenta
                            </span>
                          ) : (
                            <button
                              type="button"
                              className={
                                activo
                                  ? "boton-estado boton-desactivar"
                                  : "boton-estado boton-reactivar"
                              }
                              onClick={() =>
                                solicitarCambioEstado(persona)
                              }
                              disabled={usuarioProcesando !== null}
                            >
                              {usuarioProcesando === persona.id
                                ? "Procesando..."
                                : activo
                                  ? "Desactivar"
                                  : "Reactivar"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!cargando && (
            <p className="resumen-personal">
              Mostrando {personalFiltrado.length} de {personal.length}{" "}
              cuentas.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

export default AdministrarUsuarios;
