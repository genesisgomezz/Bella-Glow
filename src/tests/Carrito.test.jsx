/**
 * @vitest-environment jsdom
 */

import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { MemoryRouter } from "react-router-dom";

import { CarritoProvider } from "../context/CarritoContext.jsx";
import { FavoritosProvider } from "../context/FavoritosContext.jsx";
import Producto from "../components/Producto.jsx";

const productoPrueba = {
  id: 1,
  nombre: "Labial Velvet Matte",
  precio: 4500,
  imagen: "/images/labial.jpg",
  categoria: "Labios",
  descripcion: "Labial de acabado mate."
};

describe("Carrito", () => {
  test("agrega un producto al carrito", () => {
    render(
      <MemoryRouter>
        <CarritoProvider>
          <FavoritosProvider>
            <Producto {...productoPrueba} />
          </FavoritosProvider>
        </CarritoProvider>
      </MemoryRouter>
    );

    const botonAgregar = screen.getByRole("button", {
      name: /agregar/i
    });

    fireEvent.click(botonAgregar);

    expect(
      screen.getByRole("status")
    ).toHaveTextContent("Labial Velvet Matte agregado al carrito");
  });
});