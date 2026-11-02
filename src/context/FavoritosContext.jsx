
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const FavoritosContext = createContext(null);
const CLAVE_FAVORITOS = "bellaGlowFavoritos";

function recuperarFavoritos() {
  try {
    const guardados = localStorage.getItem(CLAVE_FAVORITOS);

    if (!guardados) return [];

    const productos = JSON.parse(guardados);
    return Array.isArray(productos) ? productos : [];
  } catch {
    return [];
  }
}

export function FavoritosProvider({ children }) {
  const [favoritos, setFavoritos] = useState(recuperarFavoritos);

  // Guardar los favoritos cada vez que cambien.
  useEffect(() => {
    try {
      localStorage.setItem(
        CLAVE_FAVORITOS,
        JSON.stringify(favoritos)
      );
    } catch (error) {
      console.error("No se pudieron guardar los favoritos:", error);
    }
  }, [favoritos]);

  function toggleFavorito(producto) {
    setFavoritos((actuales) => {
      const existe = actuales.some(
        (item) => item.id === producto.id
      );

      if (existe) {
        return actuales.filter(
          (item) => item.id !== producto.id
        );
      }

      return [...actuales, producto];
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
  return useContext(FavoritosContext);
}

