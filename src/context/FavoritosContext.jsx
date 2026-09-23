import { createContext, useContext, useState } from "react";

const FavoritosContext = createContext();

export function FavoritosProvider({ children }) {
    const [favoritos, setFavoritos] = useState([]);

    function toggleFavorito(producto) {
        setFavoritos((actuales) => {
            const existe = actuales.some((item) => item.id === producto.id);

            if (existe) {
                return actuales.filter((item) => item.id !== producto.id);
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
                esFavorito
            }}
        >
            {children}
        </FavoritosContext.Provider>
    );
}

export function useFavoritos() {
    return useContext(FavoritosContext);
}