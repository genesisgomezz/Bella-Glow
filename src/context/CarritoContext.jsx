import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./AuthContext";

const CarritoContext = createContext(null);

function obtenerClave(usuario) {
  const id = usuario?.id ?? usuario?.usuario_id;

  return id
    ? `bellaGlowCarrito_${id}`
    : "bellaGlowCarrito_invitado";
}

function recuperarCarrito(clave) {
  try {
    const guardado = localStorage.getItem(clave);

    if (!guardado) return [];

    const productos = JSON.parse(guardado);
    return Array.isArray(productos) ? productos : [];
  } catch {
    return [];
  }
}

export function CarritoProvider({ children }) {
  const { usuario } = useAuth();

  const claveActual = obtenerClave(usuario);

  const [datosCarrito, setDatosCarrito] = useState(() => ({
    clave: claveActual,
    productos: recuperarCarrito(claveActual),
  }));

  useEffect(() => {
    setDatosCarrito({
      clave: claveActual,
      productos: recuperarCarrito(claveActual),
    });
  }, [claveActual]);

  useEffect(() => {
    if (datosCarrito.clave !== claveActual) return;

    try {
      localStorage.setItem(
        claveActual,
        JSON.stringify(datosCarrito.productos)
      );
    } catch (error) {
      console.error("No se pudo guardar el carrito:", error);
    }
  }, [datosCarrito, claveActual]);

  const carrito =
    datosCarrito.clave === claveActual
      ? datosCarrito.productos
      : [];

  function actualizarCarrito(actualizar) {
    setDatosCarrito((actual) => {
      if (actual.clave !== claveActual) {
        return actual;
      }

      return {
        ...actual,
        productos: actualizar(actual.productos),
      };
    });
  }

  function agregarAlCarrito(producto) {
    actualizarCarrito((actual) => {
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
    actualizarCarrito((actual) =>
      actual.filter((item) => item.id !== id)
    );
  }

  function aumentarCantidad(id) {
    actualizarCarrito((actual) =>
      actual.map((item) =>
        item.id === id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      )
    );
  }

  function disminuirCantidad(id) {
    actualizarCarrito((actual) =>
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
    actualizarCarrito(() => []);
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
