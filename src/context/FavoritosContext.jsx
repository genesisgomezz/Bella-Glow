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


  // Actualiza los datos guardados cuando el administrador modifica el catálogo.
  useEffect(() => {
    let activo = true;

    async function sincronizarCatalogo() {
      try {
        const respuesta = await fetch(
          "https://bella-glow-backend.onrender.com/api/productos"
        );
        if (!respuesta.ok) return;
        const productosActuales = await respuesta.json();
        if (!activo || !Array.isArray(productosActuales)) return;

        const porId = new Map(
          productosActuales.map((producto) => [String(producto.id), producto])
        );

        setEstado((actual) => {
          if (actual.idUsuario !== idUsuario) return actual;
          return {
            ...actual,
            productos: actual.productos.map((item) => {
              const actualizado = porId.get(String(item.id));
              return actualizado ? { ...item, ...actualizado } : item;
            }),
          };
        });
      } catch (error) {
        console.warn("No se pudieron sincronizar los favoritos:", error);
      }
    }

    sincronizarCatalogo();
    const alVolver = () => {
      if (document.visibilityState === "visible") sincronizarCatalogo();
    };
    window.addEventListener("focus", sincronizarCatalogo);
    window.addEventListener("bellaGlowCatalogoActualizado", sincronizarCatalogo);
    document.addEventListener("visibilitychange", alVolver);

    return () => {
      activo = false;
      window.removeEventListener("focus", sincronizarCatalogo);
      window.removeEventListener("bellaGlowCatalogoActualizado", sincronizarCatalogo);
      document.removeEventListener("visibilitychange", alVolver);
    };
  }, [idUsuario]);

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
