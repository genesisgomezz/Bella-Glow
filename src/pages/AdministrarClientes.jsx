import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

const API_AUTH = "http://localhost:3000/api/auth";

const formularioVacio = {
  nombre: "",
  correo: "",
  contrasena: "",
};

function AdministrarClientes() {
  const { token, usuario } = useAuth();
  const esAdmin = usuario?.rol === "ADMIN";

  const [clientes, setClientes] = useState([]);
  const [formulario, setFormulario] = useState(formularioVacio);
  const [clienteEditando, setClienteEditando] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [clienteProcesando, setClienteProcesando] = useState(null);
  const [clienteConfirmacion, setClienteConfirmacion] = useState(null);

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const cargarClientes = useCallback(async () => {
    setCargando(true);
    setError("");

    try {
      const respuesta = await fetch(`${API_AUTH}/clientes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.mensaje || "No se pudieron cargar los clientes."
        );
      }

      setClientes(Array.isArray(resultado) ? resultado : []);
    } catch (err) {
      setError(err.message || "Error al cargar los clientes.");
    } finally {
      setCargando(false);
    }
  }, [token]);

  useEffect(() => {
    cargarClientes();
  }, [cargarClientes]);

  const clientesFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    return clientes.filter((cliente) => {
      const nombre = String(cliente.nombre || "").toLowerCase();
      const correo = String(cliente.correo || "").toLowerCase();

      const coincideBusqueda =
        nombre.includes(termino) || correo.includes(termino);

      const activo = Number(cliente.estado) === 1;

      const coincideEstado =
        filtroEstado === "todos" ||
        (filtroEstado === "activos" && activo) ||
        (filtroEstado === "inactivos" && !activo);

      return coincideBusqueda && coincideEstado;
    });
  }, [clientes, busqueda, filtroEstado]);

  const totalActivos = clientes.filter(
    (cliente) => Number(cliente.estado) === 1
  ).length;

  const totalInactivos = clientes.length - totalActivos;

  function manejarCambio(evento) {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  function limpiarFormulario() {
    setFormulario(formularioVacio);
    setClienteEditando(null);
  }

  function prepararEdicion(cliente) {
    setFormulario({
      nombre: cliente.nombre || "",
      correo: cliente.correo || "",
      contrasena: "",
    });

    setClienteEditando(cliente);
    setMensaje("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function guardarCliente(evento) {
    evento.preventDefault();

    setMensaje("");
    setError("");

    const nombre = formulario.nombre.trim();
    const correo = formulario.correo.trim().toLowerCase();

    if (!nombre || !correo) {
      setError("Completa el nombre y el correo electrónico.");
      return;
    }

    if (nombre.length > 150 || correo.length > 150) {
      setError("El nombre o el correo son demasiado largos.");
      return;
    }

    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

    if (!correoValido) {
      setError("Introduce un correo electrónico válido.");
      return;
    }

    setGuardando(true);

    try {
      const editando = clienteEditando !== null;

      const url = editando
        ? `${API_AUTH}/clientes/${clienteEditando.id}`
        : `${API_AUTH}/crear-cliente`;

      const cuerpo = editando
        ? { nombre, correo }
        : {
            nombre,
            correo,
            contrasena: formulario.contrasena,
          };

      if (!editando && !formulario.contrasena) {
        setError("La contraseña es obligatoria para registrar un cliente.");
        setGuardando(false);
        return;
      }

      const respuesta = await fetch(url, {
        method: editando ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cuerpo),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.mensaje ||
            (editando
              ? "No se pudo modificar el cliente."
              : "No se pudo registrar el cliente.")
        );
      }

      setMensaje(
        resultado.mensaje ||
          (editando
            ? "Cliente actualizado correctamente."
            : "Cliente registrado correctamente.")
      );

      limpiarFormulario();
      await cargarClientes();
    } catch (err) {
      setError(err.message || "Ocurrió un error al guardar el cliente.");
    } finally {
      setGuardando(false);
    }
  }

  function solicitarCambioEstado(cliente) {
    if (!esAdmin) return;

    setMensaje("");
    setError("");
    setClienteConfirmacion(cliente);
  }

  async function cambiarEstado() {
    if (!esAdmin || !clienteConfirmacion) return;

    const cliente = clienteConfirmacion;
    const estadoActual = Number(cliente.estado) === 1;
    const nuevoEstado = estadoActual ? 0 : 1;

    setMensaje("");
    setError("");
    setClienteProcesando(cliente.id);

    try {
      const respuesta = await fetch(
        `${API_AUTH}/clientes/${cliente.id}/estado`,
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
          resultado.mensaje || "No se pudo actualizar el estado del cliente."
        );
      }

      setMensaje(
        resultado.mensaje || "Estado del cliente actualizado correctamente."
      );

      setClienteConfirmacion(null);
      await cargarClientes();
    } catch (err) {
      setError(err.message || "Error al cambiar el estado del cliente.");
    } finally {
      setClienteProcesando(null);
    }
  }

  return (
    <main className="seccion pagina-admin-usuarios">
      <div className="contenedor">
        <p className="etiqueta">BELLA GLOW COSMETICS</p>

        <h1>Gestionar clientes</h1>

        <p className="panel-descripcion">
          Consulta, registra y actualiza la información de los clientes de la
          tienda.
        </p>

        {mensaje && (
          <div className="mensaje-admin" role="status">
            {mensaje}
          </div>
        )}

        {error && (
          <div className="error-admin" role="alert">
            {error}
          </div>
        )}

        <section className="resumen-personal resumen-clientes">
          <article className="tarjeta-resumen-clientes">
            <span className="icono-resumen-clientes">👥</span>
            <div>
              <p>Total de clientes</p>
              <strong>{clientes.length}</strong>
            </div>
          </article>

          <article className="tarjeta-resumen-clientes">
            <span className="icono-resumen-clientes">✅</span>
            <div>
              <p>Cuentas activas</p>
              <strong>{totalActivos}</strong>
            </div>
          </article>

          <article className="tarjeta-resumen-clientes">
            <span className="icono-resumen-clientes">⏸️</span>
            <div>
              <p>Cuentas inactivas</p>
              <strong>{totalInactivos}</strong>
            </div>
          </article>
        </section>

        <section className="seccion-formulario-personal">
          <div className="encabezado-seccion-admin">
            <span className="admin-icono">
              {clienteEditando ? "✏️" : "👤"}
            </span>

            <div>
              <h2>
                {clienteEditando ? "Editar cliente" : "Registrar cliente"}
              </h2>

              <p>
                {clienteEditando
                  ? "Modifica el nombre o el correo del cliente."
                  : "Completa los datos para crear una cuenta de cliente."}
              </p>
            </div>
          </div>

          <form className="formulario-admin-personal" onSubmit={guardarCliente}>
            <div className="campo-admin">
              <label htmlFor="nombre">Nombre completo</label>

              <input
                id="nombre"
                name="nombre"
                type="text"
                value={formulario.nombre}
                onChange={manejarCambio}
                maxLength={150}
                placeholder="Nombre del cliente"
                required
              />
            </div>

            <div className="campo-admin">
              <label htmlFor="correo">Correo electrónico</label>

              <input
                id="correo"
                name="correo"
                type="email"
                value={formulario.correo}
                onChange={manejarCambio}
                maxLength={150}
                placeholder="cliente@correo.com"
                required
              />
            </div>

            {!clienteEditando && (
              <div className="campo-admin">
                <label htmlFor="contrasena">Contraseña inicial</label>

                <input
                  id="contrasena"
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

                <small className="ayuda-formulario-clientes">
                  La contraseña se solicita únicamente al registrar una cuenta.
                </small>
              </div>
            )}

            <div className="acciones-formulario-admin">
              <button
                type="submit"
                className="boton-admin-principal"
                disabled={guardando}
              >
                {guardando
                  ? "Guardando..."
                  : clienteEditando
                    ? "Guardar cambios"
                    : "Registrar cliente"}
              </button>

              {clienteEditando && (
                <button
                  type="button"
                  className="confirmacion-cancelar"
                  onClick={limpiarFormulario}
                  disabled={guardando}
                >
                  Cancelar edición
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="seccion-tabla-personal">
          <div className="encabezado-seccion-admin">
            <div>
              <h2>Clientes registrados</h2>
              <p>Busca clientes y administra su información.</p>
            </div>
          </div>

          <div className="herramientas-personal">
            <input
              type="search"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
              placeholder="Buscar por nombre o correo..."
              aria-label="Buscar clientes por nombre o correo"
            />

            <select
              value={filtroEstado}
              onChange={(evento) => setFiltroEstado(evento.target.value)}
              aria-label="Filtrar clientes por estado"
            >
              <option value="todos">Todos los clientes</option>
              <option value="activos">Solo activos</option>
              <option value="inactivos">Solo inactivos</option>
            </select>

            <button
              type="button"
              onClick={cargarClientes}
              disabled={cargando}
            >
              Actualizar lista
            </button>
          </div>

          {cargando ? (
            <p>Cargando clientes...</p>
          ) : (
            <div className="tabla-personal-contenedor">
              <table className="tabla-personal">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Correo electrónico</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {clientesFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="4">
                        No se encontraron clientes.
                      </td>
                    </tr>
                  ) : (
                    clientesFiltrados.map((cliente) => {
                      const activo = Number(cliente.estado) === 1;

                      return (
                        <tr key={cliente.id}>
                          <td>{cliente.nombre}</td>
                          <td>{cliente.correo}</td>

                          <td>
                            <span
                              className={`estado-personal ${
                                activo ? "estado-activo" : "estado-inactivo"
                              }`}
                            >
                              {activo ? "Activo" : "Inactivo"}
                            </span>
                          </td>

                          <td>
                            <div className="acciones-tabla-clientes">
                              <button
                                type="button"
                                className="boton-estado"
                                onClick={() => prepararEdicion(cliente)}
                              >
                                Editar
                              </button>

                              {esAdmin && (
                                <button
                                  type="button"
                                  className={`boton-estado ${
                                    activo
                                      ? "boton-desactivar"
                                      : "boton-reactivar"
                                  }`}
                                  onClick={() =>
                                    solicitarCambioEstado(cliente)
                                  }
                                  disabled={clienteProcesando === cliente.id}
                                >
                                  {activo ? "Desactivar" : "Reactivar"}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {esAdmin && clienteConfirmacion && (
          <div className="confirmacion-fondo">
            <div
              className="confirmacion-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="titulo-confirmacion-cliente"
            >
              <span className="confirmacion-icono">
                {Number(clienteConfirmacion.estado) === 1 ? "⚠️" : "✅"}
              </span>

              <h2 id="titulo-confirmacion-cliente">
                {Number(clienteConfirmacion.estado) === 1
                  ? "¿Desactivar cliente?"
                  : "¿Reactivar cliente?"}
              </h2>

              <p>
                {Number(clienteConfirmacion.estado) === 1
                  ? `La cuenta de ${clienteConfirmacion.nombre} no podrá iniciar sesión mientras esté inactiva. Sus datos y pedidos se conservarán.`
                  : `¿Deseas permitir nuevamente que ${clienteConfirmacion.nombre} inicie sesión?`}
              </p>

              <div className="confirmacion-acciones">
                <button
                  type="button"
                  className="confirmacion-cancelar"
                  onClick={() => setClienteConfirmacion(null)}
                  disabled={clienteProcesando !== null}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="confirmacion-aceptar"
                  onClick={cambiarEstado}
                  disabled={clienteProcesando !== null}
                >
                  {clienteProcesando !== null
                    ? "Procesando..."
                    : "Confirmar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default AdministrarClientes;