import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

const API_BASE = "https://bella-glow-backend.onrender.com";

function formatearColones(valor) {
  return `₡${Number(valor || 0).toLocaleString("es-CR", {
    maximumFractionDigits: 0,
  })}`;
}

function formatearFecha(fecha) {
  if (!fecha) return "Fecha no disponible";

  const resultado = new Date(String(fecha).replace(" ", "T"));

  if (Number.isNaN(resultado.getTime())) return String(fecha);

  return resultado.toLocaleString("es-CR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function nombreEstado(estado) {
  const nombres = {
    PENDIENTE: "Pendiente",
    PAGADO: "Pagado",
    CANCELADO: "Cancelado",
  };

  return nombres[estado] || estado;
}

function AdministrarPedidos() {
  const { token } = useAuth();

  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [errorEstado, setErrorEstado] = useState("");
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("");
  const [actualizando, setActualizando] = useState(null);

  useEffect(() => {
    const controlador = new AbortController();

    async function cargarPedidos() {
      setCargando(true);
      setError("");

      try {
        const respuesta = await fetch(`${API_BASE}/api/pedidos`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controlador.signal,
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error(
            datos.mensaje || "No se pudieron consultar los pedidos."
          );
        }

        setPedidos(Array.isArray(datos) ? datos : []);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(
            err.message || "Ocurrió un error al consultar los pedidos."
          );
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCargando(false);
        }
      }
    }

    if (token) {
      cargarPedidos();
    } else {
      setError("Debes iniciar sesión para continuar.");
      setCargando(false);
    }

    return () => controlador.abort();
  }, [token]);

  function abrirCambioEstado(pedido, estado) {
    setPedidoSeleccionado(pedido.id);
    setEstadoSeleccionado(estado);
    setMensaje("");
    setErrorEstado("");
  }

  function cerrarCambioEstado() {
    setPedidoSeleccionado(null);
    setEstadoSeleccionado("");
    setErrorEstado("");
  }

  async function confirmarCambioEstado(pedido) {
    if (!["PAGADO", "CANCELADO"].includes(estadoSeleccionado)) {
      setErrorEstado("Selecciona un estado válido.");
      return;
    }

    setActualizando(pedido.id);
    setMensaje("");
    setErrorEstado("");

    try {
      const respuesta = await fetch(
        `${API_BASE}/api/pedidos/${pedido.id}/estado`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            estado: estadoSeleccionado,
          }),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.mensaje || "No se pudo actualizar el estado."
        );
      }

      const nuevoEstado = datos.pedido?.estado || estadoSeleccionado;

      setPedidos((actuales) =>
        actuales.map((item) =>
          item.id === pedido.id
            ? { ...item, estado: nuevoEstado }
            : item
        )
      );

      setMensaje(
        `El pedido #${pedido.id} ahora está ${nombreEstado(nuevoEstado).toLowerCase()}.`
      );

      cerrarCambioEstado();
    } catch (err) {
      setErrorEstado(
        err.message || "No se pudo conectar con el servidor."
      );
    } finally {
      setActualizando(null);
    }
  }

  const totalPedidos = pedidos.length;

  const pendientes = pedidos.filter(
    (pedido) =>
      String(pedido.estado).toUpperCase() === "PENDIENTE"
  ).length;

  const totalVentasRegistradas = pedidos.reduce(
    (suma, pedido) => suma + Number(pedido.total || 0),
    0
  );

  return (
    <main className="seccion panel-administracion">
      <div className="contenedor">
        <p className="etiqueta">BELLA GLOW COSMETICS</p>

        <h1>Gestión de pedidos</h1>

        <p className="panel-descripcion">
          Consulta las compras registradas y administra sus estados.
        </p>

        <div className="admin-tarjetas">
          <article className="admin-tarjeta">
            <div className="admin-icono">🧾</div>
            <h2>{totalPedidos}</h2>
            <p>Pedidos registrados</p>
          </article>

          <article className="admin-tarjeta">
            <div className="admin-icono">⏳</div>
            <h2>{pendientes}</h2>
            <p>Pedidos pendientes</p>
          </article>

          <article className="admin-tarjeta">
            <div className="admin-icono">💰</div>
            <h2>{formatearColones(totalVentasRegistradas)}</h2>
            <p>Total registrado de los pedidos consultados</p>
          </article>
        </div>

        <div className="pedidos-admin-lista">
          <h2>Pedidos recientes</h2>

          {cargando && <p>Cargando pedidos...</p>}

          {error && (
            <p role="alert" className="pedidos-error">
              {error}
            </p>
          )}

          {mensaje && (
            <p role="status" className="admin-mensaje-exito">
              ✓ {mensaje}
            </p>
          )}

          {!cargando && !error && pedidos.length === 0 && (
            <p>Todavía no hay pedidos registrados.</p>
          )}

          {!cargando &&
            !error &&
            pedidos.map((pedido) => {
              const estado = String(
                pedido.estado || "PENDIENTE"
              ).toUpperCase();

              const esPendiente = estado === "PENDIENTE";
              const seleccionado = pedidoSeleccionado === pedido.id;
              const procesando = actualizando === pedido.id;

              return (
                <article className="pedido-tarjeta" key={pedido.id}>
                  <div className="pedido-resumen">
                    <div className="pedido-icono">🛍️</div>

                    <div className="pedido-identificacion">
                      <h2>Pedido #{pedido.id}</h2>
                      <p>{pedido.cliente || "Cliente"}</p>

                      {pedido.correo_cliente && (
                        <p>{pedido.correo_cliente}</p>
                      )}

                      <p>{formatearFecha(pedido.fecha)}</p>
                    </div>

                    <span
                      className={`pedido-estado estado-${estado.toLowerCase()}`}
                    >
                      {nombreEstado(estado)}
                    </span>

                    <div className="pedido-total">
                      <span>Total del pedido</span>
                      <strong>{formatearColones(pedido.total)}</strong>
                    </div>
                  </div>

                  {esPendiente && (
                    <div className="admin-acciones-pedido">
                      {!seleccionado ? (
                        <>
                          <button
                            type="button"
                            className="admin-estado-boton admin-pagado-boton"
                            onClick={() =>
                              abrirCambioEstado(pedido, "PAGADO")
                            }
                            disabled={procesando}
                          >
                            ✓ Marcar como pagado
                          </button>

                          <button
                            type="button"
                            className="admin-estado-boton admin-cancelar-boton"
                            onClick={() =>
                              abrirCambioEstado(pedido, "CANCELADO")
                            }
                            disabled={procesando}
                          >
                            ✕ Cancelar pedido
                          </button>
                        </>
                      ) : (
                        <div className="admin-confirmacion-estado">
                          <h3>
                            {estadoSeleccionado === "PAGADO"
                              ? "¿Confirmar pedido pagado?"
                              : "¿Cancelar este pedido?"}
                          </h3>

                          <p>
                            {estadoSeleccionado === "PAGADO"
                              ? "Esto registrará el estado como pagado, pero no realizará ningún cobro."
                              : "El pedido quedará cancelado. Esta acción no se puede deshacer desde esta pantalla."}
                          </p>

                          {errorEstado && (
                            <p role="alert" className="pedidos-error">
                              {errorEstado}
                            </p>
                          )}

                          <div className="admin-confirmacion-botones">
                            <button
                              type="button"
                              className="admin-estado-boton admin-confirmar-boton"
                              onClick={() => confirmarCambioEstado(pedido)}
                              disabled={procesando}
                            >
                              {procesando
                                ? "Guardando..."
                                : "Sí, confirmar"}
                            </button>

                            <button
                              type="button"
                              className="admin-estado-boton admin-volver-boton"
                              onClick={cerrarCambioEstado}
                              disabled={procesando}
                            >
                              Volver
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {!esPendiente && (
                    <div className="admin-pedido-finalizado">
                      Este pedido está {nombreEstado(estado).toLowerCase()}.
                      No admite más cambios desde esta pantalla.
                    </div>
                  )}
                </article>
              );
            })}
        </div>

        <p className="panel-descripcion">
          Nota: cambiar un pedido a “Pagado” no realiza un cobro en línea.
        </p>
      </div>
    </main>
  );
}

export default AdministrarPedidos;
