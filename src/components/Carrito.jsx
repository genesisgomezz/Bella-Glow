
import { useState } from "react";
import { useCarrito } from "../context/CarritoContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const API_BASE = "http://localhost:3000";

function precioEnColones(producto) {
  // Los pedidos solo admiten productos registrados en MySQL.
  return Number(producto.precio) || 0;
}

function formatearColones(precio) {
  return `₡${Math.round(precio).toLocaleString("es-CR")}`;
}

function Carrito() {
  const {
    carrito,
    aumentarCantidad,
    disminuirCantidad,
    quitarDelCarrito,
    vaciarCarrito,
  } = useCarrito();

  const { usuario, token, autenticado } = useAuth();

  const [mostrarConfirmacion, setMostrarConfirmacion] =
    useState(false);
  const [comprando, setComprando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("");

  function cerrarCarrito() {
    cerrarConfirmacion();

    const carritoModal = document.getElementById("modal-carrito");

    if (carritoModal?.open) {
      carritoModal.close();
    }
  }

  function abrirConfirmacion() {
    const confirmacion = document.getElementById(
      "confirmacion-vaciar"
    );

    if (!confirmacion || confirmacion.open) return;

    setMostrarConfirmacion(true);
    confirmacion.showModal();
  }

  function cerrarConfirmacion() {
    const confirmacion = document.getElementById(
      "confirmacion-vaciar"
    );

    setMostrarConfirmacion(false);

    if (confirmacion?.open) {
      confirmacion.close();
    }
  }

  function confirmarVaciado() {
    vaciarCarrito();
    setMensaje("");
    cerrarConfirmacion();
  }

  const totalEnColones = carrito.reduce(
    (total, producto) =>
      total + precioEnColones(producto) * producto.cantidad,
    0
  );

  async function finalizarCompra() {
    setMensaje("");
    setTipoMensaje("");

    if (!autenticado || !token || !usuario) {
      setTipoMensaje("error");
      setMensaje("Debes iniciar sesión como cliente para comprar.");
      return;
    }

    if (usuario.rol !== "CLIENTE") {
      setTipoMensaje("error");
      setMensaje("Esta compra debe realizarse con una cuenta de cliente.");
      return;
    }

    if (carrito.length === 0) {
      setTipoMensaje("error");
      setMensaje("Tu carrito está vacío.");
      return;
    }

    const productosExternos = carrito.some(
      (producto) =>
        producto.origen === "externo" ||
        !Number.isSafeInteger(Number(producto.id)) ||
        Number(producto.id) <= 0
    );

    if (productosExternos) {
      setTipoMensaje("error");
      setMensaje(
        "Hay productos externos en tu carrito. Retíralos y agrega productos del catálogo de la tienda para continuar."
      );
      return;
    }

    setComprando(true);

    try {
      const respuesta = await fetch(`${API_BASE}/api/pedidos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productos: carrito.map((producto) => ({
            producto_id: Number(producto.id),
            cantidad: Number(producto.cantidad),
          })),
        }),
      });

      const datos = await respuesta.json().catch(() => ({}));

      if (!respuesta.ok) {
        if (respuesta.status === 401) {
          throw new Error(
            "Tu sesión expiró o no es válida. Inicia sesión nuevamente."
          );
        }

        throw new Error(
          datos.mensaje || "No se pudo registrar el pedido."
        );
      }

      vaciarCarrito();

      setTipoMensaje("exito");
      setMensaje(
        datos.mensaje
          ? `¡Pedido registrado! ${datos.mensaje}`
          : "¡Tu pedido se registró correctamente!"
      );
    } catch (error) {
      setTipoMensaje("error");
      setMensaje(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al registrar el pedido."
      );
    } finally {
      setComprando(false);
    }
  }

  return (
    <>
      <dialog id="modal-carrito" className="modal carrito-modal">
        <button
          type="button"
          className="cerrar"
          onClick={cerrarCarrito}
          aria-label="Cerrar carrito"
        >
          ×
        </button>

        <h2>🛍️ Mi carrito</h2>

        {mensaje && (
          <p
            role="status"
            aria-live="polite"
            className={
              tipoMensaje === "exito"
                ? "mensaje-compra exito"
                : "mensaje-compra error"
            }
          >
            {mensaje}
          </p>
        )}

        {carrito.length === 0 ? (
          <div className="carrito-vacio">
            <p>Tu carrito está vacío.</p>
          </div>
        ) : (
          <>
            <div className="lista-carrito">
              {carrito.map((producto) => {
                const precioUnitario = precioEnColones(producto);
                const subtotal =
                  precioUnitario * producto.cantidad;

                return (
                  <div
                    className="item-carrito"
                    key={producto.id}
                  >
                    <img
                      src={
                        producto.imagen?.startsWith("/uploads/")
                          ? `${API_BASE}${producto.imagen}`
                          : producto.imagen || "/img/productos.svg"
                      }
                      alt={producto.nombre}
                      onError={(evento) => {
                        evento.currentTarget.onerror = null;
                        evento.currentTarget.src =
                          "/img/productos.svg";
                      }}
                    />

                    <div className="info-carrito">
                      <h3>{producto.nombre}</h3>

                      <p className="precio-unitario">
                        {formatearColones(precioUnitario)} cada uno
                      </p>

                      <div className="cantidad-carrito">
                        <button
                          type="button"
                          disabled={comprando}
                          onClick={() =>
                            disminuirCantidad(producto.id)
                          }
                          aria-label={`Disminuir ${producto.nombre}`}
                        >
                          −
                        </button>

                        <span>{producto.cantidad}</span>

                        <button
                          type="button"
                          disabled={comprando}
                          onClick={() =>
                            aumentarCantidad(producto.id)
                          }
                          aria-label={`Aumentar ${producto.nombre}`}
                        >
                          +
                        </button>
                      </div>

                      <strong>{formatearColones(subtotal)}</strong>
                    </div>

                    <button
                      type="button"
                      className="eliminar-carrito"
                      disabled={comprando}
                      onClick={() =>
                        quitarDelCarrito(producto.id)
                      }
                    >
                      Eliminar
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="total-carrito">
              <div>
                <span>Total estimado</span>
                <strong>{formatearColones(totalEnColones)}</strong>
              </div>

              <button
                type="button"
                className="boton secundario"
                disabled={comprando}
                onClick={abrirConfirmacion}
              >
                Vaciar carrito
              </button>

              <button
                type="button"
                className="boton"
                disabled={comprando}
                onClick={finalizarCompra}
              >
                {comprando
                  ? "Registrando pedido..."
                  : "Finalizar compra"}
              </button>
            </div>
          </>
        )}
      </dialog>

      <dialog
        id="confirmacion-vaciar"
        className="confirmacion-vaciar"
      >
        <div className="confirmacion-vaciar-contenido">
          <div className="icono-confirmacion">🗑️</div>

          <div className="texto-confirmacion">
            <strong>¿Vaciar carrito?</strong>
            <span>Se eliminarán todos los productos.</span>
          </div>

          <div className="confirmacion-vaciar-acciones">
            <button
              type="button"
              className="confirmacion-cancelar"
              onClick={cerrarConfirmacion}
            >
              Cancelar
            </button>

            <button
              type="button"
              className="confirmacion-confirmar"
              onClick={confirmarVaciado}
            >
              Sí, vaciar
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

export default Carrito;