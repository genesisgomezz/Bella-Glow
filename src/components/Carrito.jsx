import { useCarrito } from "../context/CarritoContext.jsx";

function Carrito() {
  const {
    carrito,
    aumentarCantidad,
    disminuirCantidad,
    quitarDelCarrito,
    vaciarCarrito,
    total
  } = useCarrito();

  function cerrarCarrito() {
    document.getElementById("modal-carrito")?.close();
  }

  return (
    <dialog id="modal-carrito" className="modal carrito-modal">

      <button
        className="cerrar"
        onClick={cerrarCarrito}
        aria-label="Cerrar carrito"
      >
        ×
      </button>

      <h2>🛍️ Mi carrito</h2>

      {carrito.length === 0 ? (
        <div className="carrito-vacio">
          <p>Tu carrito está vacío.</p>
        </div>
      ) : (
        <>
          <div className="lista-carrito">

            {carrito.map((producto) => (
              <div
                className="item-carrito"
                key={producto.id}
              >

                <img
                  src={producto.imagen}
                  alt={producto.nombre}
                />

                <div className="info-carrito">

                  <h3>{producto.nombre}</h3>

                  <p className="precio-unitario">
                    ₡{producto.precio.toLocaleString("es-CR")} cada uno
                  </p>

                  <div className="cantidad-carrito">

                    <button
                      type="button"
                      onClick={() =>
                        disminuirCantidad(producto.id)
                      }
                    >
                      −
                    </button>

                    <span>{producto.cantidad}</span>

                    <button
                      type="button"
                      onClick={() =>
                        aumentarCantidad(producto.id)
                      }
                    >
                      +
                    </button>

                  </div>

                  <strong>
                    ₡{(
                      producto.precio * producto.cantidad
                    ).toLocaleString("es-CR")}
                  </strong>

                </div>

                <button
                  type="button"
                  className="eliminar-carrito"
                  onClick={() =>
                    quitarDelCarrito(producto.id)
                  }
                >
                  Eliminar
                </button>

              </div>
            ))}

          </div>

          <div className="total-carrito">

            <div>
              <span>Total</span>

              <strong>
                ₡{total.toLocaleString("es-CR")}
              </strong>
            </div>

            <button
              type="button"
              className="boton secundario"
              onClick={vaciarCarrito}
            >
              Vaciar carrito
            </button>

          </div>
        </>
      )}

    </dialog>
  );
}

export default Carrito;