import { createContext, useContext, useState } from "react";

const CarritoContext = createContext();

export function CarritoProvider({ children }) {
  const [carrito, setCarrito] = useState([]);

  function agregarAlCarrito(producto) {
    setCarrito((actual) => {
      const existe = actual.find(
        (item) => item.id === producto.id
      );

      if (existe) {
        return actual.map((item) =>
          item.id === producto.id
            ? {
                ...item,
                cantidad: item.cantidad + 1
              }
            : item
        );
      }

      return [
        ...actual,
        {
          ...producto,
          cantidad: 1
        }
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
          ? {
              ...item,
              cantidad: item.cantidad + 1
            }
          : item
      )
    );
  }

  function disminuirCantidad(id) {
    setCarrito((actual) =>
      actual
        .map((item) =>
          item.id === id
            ? {
                ...item,
                cantidad: item.cantidad - 1
              }
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

  const total = carrito.reduce(
    (suma, item) =>
      suma + item.precio * item.cantidad,
    0
  );

  return (
    <CarritoContext.Provider
      value={{
        carrito,
        agregarAlCarrito,
        aumentarCantidad,
        disminuirCantidad,
        quitarDelCarrito,
        vaciarCarrito,
        cantidadTotal,
        total
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
}

export function useCarrito() {
  return useContext(CarritoContext);
}