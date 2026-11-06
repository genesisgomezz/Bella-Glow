
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { useAuth } from "./AuthContext";

const FavoritosContext = createContext(null);

function obtenerIdUsuario(usuario) {
  return usuario?.id ?? usuario?.usuario_id ?? "invitado";
}

function obtenerClave(idUsuario) {
  return `bellaGlowFavoritos_${idUsuario}`;
}

function recuperarFavoritos(idUsuario) {
  try {
    const guardados = localStorage.getItem(
      obtenerClave(idUsuario)
    );

    if (!guardados) return [];

    const productos = JSON.parse(guardados);

    return Array.isArray(productos) ? productos : [];
  } catch {
    return [];
  }
}

export function FavoritosProvider({ children }) {
  const { usuario } = useAuth();

  const idUsuario = obtenerIdUsuario(usuario);

  const [estado, setEstado] = useState(() => ({
    idUsuario,
    productos: recuperarFavoritos(idUsuario),
  }));

  // Cargar los favoritos cuando cambia la cuenta
  useEffect(() => {
    setEstado({
      idUsuario,
      productos: recuperarFavoritos(idUsuario),
    });
  }, [idUsuario]);

  // Evitar guardar favoritos de otra cuenta
  useEffect(() => {
    if (estado.idUsuario !== idUsuario) return;

    try {
      localStorage.setItem(
        obtenerClave(idUsuario),
        JSON.stringify(estado.productos)
      );
    } catch (error) {
      console.error(
        "No se pudieron guardar los favoritos:",
        error
      );
    }
  }, [estado, idUsuario]);

  const favoritos =
    estado.idUsuario === idUsuario
      ? estado.productos
      : [];

  function toggleFavorito(producto) {
    setEstado((actual) => {
      const actuales =
        actual.idUsuario === idUsuario
          ? actual.productos
          : [];

      const existe = actuales.some(
        (item) => item.id === producto.id
      );

      const nuevos = existe
        ? actuales.filter(
            (item) => item.id !== producto.id
          )
        : [...actuales, producto];

      return {
        idUsuario,
        productos: nuevos,
      };
    });
  }

  function esFavorito(id) {
    return favoritos.some((item) => item.id === id);
  }

  return (
    <FavoritosContext.Provider
      value={{
        favoritos,
        toggleFavorito,
        esFavorito,
      }}
    >
      {children}
    </FavoritosContext.Provider>
  );
}

export function useFavoritos() {
  const contexto = useContext(FavoritosContext);

  if (!contexto) {
    throw new Error(
      "useFavoritos debe utilizarse dentro de FavoritosProvider."
    );
  }

  return contexto;
}
