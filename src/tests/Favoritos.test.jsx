/**
 * @vitest-environment jsdom
 */

import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { MemoryRouter } from "react-router-dom";

import Producto from "../components/Producto.jsx";
import { CarritoProvider } from "../context/CarritoContext.jsx";
import { FavoritosProvider } from "../context/FavoritosContext.jsx";

const productoPrueba = {
  id: 1,
  nombre: "Labial Velvet Matte",
  precio: 4500,
  imagen: "/images/labial.jpg",
  categoria: "Labios",
  descripcion: "Labial de acabado mate."
};

describe("Favoritos", () => {
  test("agrega un producto a favoritos", () => {
    render(
      <MemoryRouter>
        <CarritoProvider>
          <FavoritosProvider>
            <Producto {...productoPrueba} />
          </FavoritosProvider>
        </CarritoProvider>
      </MemoryRouter>
    );

    const botonFavorito = screen.getByRole("button", {
      name: "Favorito Labial Velvet Matte"
    });

    expect(botonFavorito).toHaveTextContent("♡");

    fireEvent.click(botonFavorito);

    expect(botonFavorito).toHaveTextContent("♥");

    expect(
      screen.getByRole("status")
    ).toHaveTextContent(
      "Labial Velvet Matte agregado a favoritos"
    );
  });
});