
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const API_BASE = "http://localhost:3000";

function formatearColones(valor) {
  return `₡${Number(valor || 0).toLocaleString("es-CR", {
    maximumFractionDigits: 0,
  })}`;
}

function formatearFecha(fecha) {
  if (!fecha) return "Fecha no disponible";

  const normalizada = String(fecha).replace(" ", "T");
  const resultado = new Date(normalizada);

  if (Number.isNaN(resultado.getTime())) return String(fecha);

  return resultado.toLocaleString("es-CR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function estadoNormalizado(estado) {
  return String(estado || "PENDIENTE").toUpperCase();
}

function MisPedidos() {
  const { token } = useAuth();

  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [pedidoAbierto, setPedidoAbierto] = useState(null);
  const [detalles, setDetalles] = useState({});
  const [cargandoDetalle, setCargandoDetalle] = useState(null);
  const [erroresDetalle, setErroresDetalle] = useState({});

  useEffect(() => {
    const controlador = new AbortController();

    async function cargarPedidos() {
      setCargando(true);
      setError("");

      try {
        const respuesta = await fetch(
          `${API_BASE}/api/pedidos/mis-pedidos`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controlador.signal,
          }
        );

        const datos = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error(
            datos.mensaje || "No se pudieron cargar tus pedidos."
          );
        }

        setPedidos(Array.isArray(datos) ? datos : []);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(
            err.message || "No se pudieron consultar tus pedidos."
          );
        }
      } finally {
        if (!controlador.signal.aborted) setCargando(false);
      }
    }

    if (token) {
      cargarPedidos();
    } else {
      setError("Debes iniciar sesión para consultar tus pedidos.");
      setCargando(false);
    }

    return () => controlador.abort();
  }, [token]);

  async function alternarDetalle(pedidoId) {
    if (pedidoAbierto === pedidoId) {
      setPedidoAbierto(null);
      return;
    }

    setPedidoAbierto(pedidoId);

    if (detalles[pedidoId]) return;

    setCargandoDetalle(pedidoId);
    setErroresDetalle((actuales) => ({
      ...actuales,
      [pedidoId]: "",
    }));

    try {
      const respuesta = await fetch(
        `${API_BASE}/api/pedidos/${pedidoId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.mensaje || "No se pudo cargar el detalle."
        );
      }

      setDetalles((actuales) => ({
        ...actuales,
        [pedidoId]: Array.isArray(datos.detalles)
          ? datos.detalles
          : [],
      }));
    } catch (err) {
      setErroresDetalle((actuales) => ({
        ...actuales,
        [pedidoId]:
          err.message || "Ocurrió un error al consultar el pedido.",
      }));
    } finally {
      setCargandoDetalle(null);
    }
  }

  return (
    <main className="seccion mis-pedidos-pagina">
      <div className="contenedor mis-pedidos-contenedor">
        <p className="etiqueta">BELLA GLOW COSMETICS</p>
        <h1 className="mis-pedidos-titulo">Mis pedidos</h1>
        <p className="mis-pedidos-intro">
          Tus compras, siempre a tu alcance ♡
        </p>

        {cargando && (
          <p className="pedidos-mensaje">Cargando tus pedidos...</p>
        )}

        {error && (
          <div className="pedidos-error" role="alert">
            {error}
          </div>
        )}

        {!cargando && !error && pedidos.length === 0 && (
          <div className="pedidos-vacios">
            <div className="pedidos-icono-vacio">♡</div>
            <h2>Aún no tienes pedidos</h2>
            <p>
              Cuando realices una compra, podrás consultar aquí
              todos sus detalles.
            </p>
            <Link to="/productos" className="boton">
              Explorar productos
            </Link>
          </div>
        )}

        {!cargando && !error && pedidos.length > 0 && (
          <div className="pedidos-lista">
            {pedidos.map((pedido) => {
              const abierto = pedidoAbierto === pedido.id;
              const estado = estadoNormalizado(pedido.estado);

              return (
                <article className="pedido-tarjeta" key={pedido.id}>
                  <div className="pedido-resumen">
                    <div className="pedido-icono">
                      <span aria-hidden="true">♧</span>
                    </div>

                    <div className="pedido-identificacion">
                      <h2>Pedido #{pedido.id}</h2>
                      <p>{formatearFecha(pedido.fecha)}</p>
                    </div>

                    <span
                      className={`pedido-estado estado-${estado.toLowerCase()}`}
                    >
                      {estado === "PENDIENTE"
                        ? "Pendiente"
                        : estado === "PAGADO"
                          ? "Pagado"
                          : estado === "CANCELADO"
                            ? "Cancelado"
                            : pedido.estado}
                    </span>

                    <div className="pedido-total">
                      <span>Total del pedido</span>
                      <strong>{formatearColones(pedido.total)}</strong>
                    </div>

                    <button
                      type="button"
                      className="pedido-desplegar"
                      onClick={() => alternarDetalle(pedido.id)}
                      aria-expanded={abierto}
                      aria-label={
                        abierto
                          ? `Cerrar pedido ${pedido.id}`
                          : `Ver pedido ${pedido.id}`
                      }
                    >
                      {abierto ? "⌃" : "⌄"}
                    </button>
                  </div>

                  {abierto && (
                    <div className="pedido-detalle">
                      <h3>Productos del pedido</h3>

                      {cargandoDetalle === pedido.id && (
                        <p>Cargando productos...</p>
                      )}

                      {erroresDetalle[pedido.id] && (
                        <p className="pedidos-error" role="alert">
                          {erroresDetalle[pedido.id]}
                        </p>
                      )}

                      {cargandoDetalle !== pedido.id &&
                        !erroresDetalle[pedido.id] &&
                        detalles[pedido.id]?.length === 0 && (
                          <p>No hay productos para mostrar.</p>
                        )}

                      {cargandoDetalle !== pedido.id &&
                        detalles[pedido.id]?.map((item, indice) => {
                          const nombre =
                            item.nombre ??
                            item.producto ??
                            "Producto";

                          const cantidad = Number(item.cantidad) || 0;

                          const precio = Number(
                            item.precio_unitario ?? item.precio
                          ) || 0;

                          const imagen = item.imagen
                            ? item.imagen.startsWith("/uploads/")
                              ? `${API_BASE}${item.imagen}`
                              : item.imagen
                            : "/img/productos.svg";

                          return (
                            <div
                              className="pedido-producto"
                              key={`${item.producto_id ?? item.id ?? nombre}-${indice}`}
                            >
                              <img
                                src={imagen}
                                alt={nombre}
                                onError={(evento) => {
                                  evento.currentTarget.onerror = null;
                                  evento.currentTarget.src =
                                    "/img/productos.svg";
                                }}
                              />

                              <div className="pedido-producto-info">
                                <strong>{nombre}</strong>
                                <span>Cantidad: {cantidad}</span>
                                <span>
                                  Precio unitario: {formatearColones(precio)}
                                </span>
                              </div>

                              <strong className="pedido-subtotal">
                                {formatearColones(precio * cantidad)}
                              </strong>
                            </div>
                          );
                        })}

                      <div className="pedido-total-detalle">
                        <span>Total del pedido</span>
                        <strong>{formatearColones(pedido.total)}</strong>
                      </div>
                    </div>
                  )}

                  <div className="pedido-pie">
                    <button
                      type="button"
                      className="pedido-boton-detalle"
                      onClick={() => alternarDetalle(pedido.id)}
                    >
                      {abierto ? "Cerrar detalle" : "Ver detalle"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default MisPedidos;
