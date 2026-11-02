
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const CarritoContext = createContext(null);
const CLAVE_CARRITO = "bellaGlowCarrito";

function recuperarCarrito() {
  try {
    const guardado = localStorage.getItem(CLAVE_CARRITO);

    if (!guardado) return [];

    const productos = JSON.parse(guardado);
    return Array.isArray(productos) ? productos : [];
  } catch {
    return [];
  }
}

export function CarritoProvider({ children }) {
  const [carrito, setCarrito] = useState(recuperarCarrito);

  // Guardar automáticamente cada cambio del carrito.
  useEffect(() => {
    try {
      localStorage.setItem(
        CLAVE_CARRITO,
        JSON.stringify(carrito)
      );
    } catch (error) {
      console.error("No se pudo guardar el carrito:", error);
    }
  }, [carrito]);

  function agregarAlCarrito(producto) {
    setCarrito((actual) => {
      const existe = actual.find(
        (item) => item.id === producto.id
      );

      if (existe) {
        return actual.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }

      return [
        ...actual,
        {
          ...producto,
          origen: producto.origen || "local",
          cantidad: 1,
        },
      ];
    });
  }

  function quitarDelCarrito(id) {
    setCarrito((actual) =>
      actual.filter((item) => item.id !== id)
    );
  }

  function aumentarCantidad(id) {
    setCarrito((actual) =>
      actual.map((item) =>
        item.id === id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      )
    );
  }

  function disminuirCantidad(id) {
    setCarrito((actual) =>
      actual
        .map((item) =>
          item.id === id
            ? { ...item, cantidad: item.cantidad - 1 }
            : item
        )
        .filter((item) => item.cantidad > 0)
    );
  }

  function vaciarCarrito() {
    setCarrito([]);
  }

  const cantidadTotal = carrito.reduce(
    (total, item) => total + item.cantidad,
    0
  );

  const totalColones = carrito.reduce(
    (suma, item) =>
      item.origen !== "externo"
        ? suma + Number(item.precio) * item.cantidad
        : suma,
    0
  );

  const totalDolares = carrito.reduce(
    (suma, item) =>
      item.origen === "externo"
        ? suma + Number(item.precio) * item.cantidad
        : suma,
    0
  );

  return (
    <CarritoContext.Provider
      value={{
        carrito,
        agregarAlCarrito,
        quitarDelCarrito,
        aumentarCantidad,
        disminuirCantidad,
        vaciarCarrito,
        cantidadTotal,
        totalColones,
        totalDolares,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
}

export function useCarrito() {
  return useContext(CarritoContext);
}
