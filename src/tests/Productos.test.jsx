/**
 * @vitest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/vitest";

import Productos from "../pages/Productos.jsx";
import { CarritoProvider } from "../context/CarritoContext.jsx";
import { FavoritosProvider } from "../context/FavoritosContext.jsx";

describe("Página de productos", () => {
  test("muestra el catálogo de productos", () => {
    render(
      <MemoryRouter>
        <CarritoProvider>
          <FavoritosProvider>
            <Productos />
          </FavoritosProvider>
        </CarritoProvider>
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", {
        name: "Catálogo de productos"
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText("Labial Velvet Matte")
    ).toBeInTheDocument();
  });
});