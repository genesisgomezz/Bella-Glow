import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { useCarrito } from "../context/CarritoContext.jsx";

const productos = [
  {
    id: 1,
    nombre: "Labial Velvet Matte",
    categoria: "Labios",
    descripcion:
      "Color intenso con acabado matte y textura cómoda.",
    imagen: "/img/labial.svg",
    precio: 8500
  },
  {
    id: 2,
    nombre: "Gloss Crystal Shine",
    categoria: "Labios",
    descripcion:
      "Brillo ligero para un acabado luminoso.",
    imagen: "/img/GlossCrystalShine.jpg",
    precio: 6900
  },
  {
    id: 3,
    nombre: "Base Glow Skin",
    categoria: "Rostro",
    descripcion:
      "Cobertura natural y uniforme con acabado luminoso.",
    imagen: "/img/base.svg",
    precio: 12500
  },
  {
    id: 4,
    nombre: "Corrector Soft Cover",
    categoria: "Rostro",
    descripcion:
      "Cobertura suave para unificar el tono.",
    imagen: "/img/CorrectorSoftCover.jpg",
    precio: 9500
  },
  {
    id: 5,
    nombre: "Máscara Lash Bloom",
    categoria: "Ojos",
    descripcion:
      "Define y realza las pestañas para una mirada expresiva.",
    imagen: "/img/MáscaraLashBloom.jpg",
    precio: 7900
  },
  {
    id: 6,
    nombre: "Delineador Precision",
    categoria: "Ojos",
    descripcion:
      "Trazo definido y elegante para distintos looks.",
    imagen: "/img/DelineadorPrecision.jpg",
    precio: 6500
  },
  {
    id: 7,
    nombre: "Paleta Sunset Nude",
    categoria: "Paletas",
    descripcion:
      "Tonos cálidos y versátiles para el día o la noche.",
    imagen: "/img/PaletaSunsetNude.jpg",
    precio: 15900
  },
  {
    id: 8,
    nombre: "Paleta Rose Dream",
    categoria: "Paletas",
    descripcion:
      "Selección de tonos rosados y neutros combinables.",
    imagen: "/img/PaletaRoseDream.jpg",
    precio: 16900
  },
  {
    id: 9,
    nombre: "Rubor Soft Rose",
    categoria: "Rubor",
    descripcion:
      "Color delicado para un acabado fresco y natural.",
    imagen: "/img/rubor.svg",
    precio: 6900
  },
  {
    id: 10,
    nombre: "Rubor Peach Glow",
    categoria: "Rubor",
    descripcion:
      "Tono durazno para dar calidez al rostro.",
    imagen: "/img/rubor.svg",
    precio: 7200
  },
  {
    id: 11,
    nombre: "Iluminador Pearl Glow",
    categoria: "Iluminadores",
    descripcion:
      "Luminosidad sutil para destacar puntos del rostro.",
    imagen: "/img/Iluminadores.jpg",
    precio: 8900
  },
  {
    id: 12,
    nombre: "Iluminador Golden Touch",
    categoria: "Iluminadores",
    descripcion:
      "Acabado radiante con reflejos cálidos.",
    imagen: "/img/Iluminadores.jpg",
    precio: 9200
  },
  {
    id: 13,
    nombre: "Set Brochas Essential",
    categoria: "Brochas",
    descripcion:
      "Brochas esenciales para rostro y ojos.",
    imagen: "/img/brochas.svg",
    precio: 11900
  },
  {
    id: 14,
    nombre: "Esponja Beauty Blend",
    categoria: "Brochas",
    descripcion:
      "Accesorio suave para aplicar y difuminar productos.",
    imagen: "/img/EsponjaBeautyBlend.jpg",
    precio: 4500
  },
  {
    id: 15,
    nombre: "Sérum Glow Prep",
    categoria: "Skincare",
    descripcion:
      "Preparación ligera para una apariencia hidratada.",
    imagen: "/img/SérumGlowPrep.jpg",
    precio: 10900
  },
  {
    id: 16,
    nombre: "Crema Soft Hydration",
    categoria: "Skincare",
    descripcion:
      "Hidratación ligera para complementar tu rutina.",
    imagen: "/img/CremaSoftHydration.jpg",
    precio: 9900
  }
];

function DetalleProducto() {
  const { id } = useParams();
  const { agregarAlCarrito } = useCarrito();

  const [mensaje, setMensaje] = useState("");

  const producto = productos.find(
    (item) => item.id === Number(id)
  );

  if (!producto) {
    return (
      <main className="seccion">
        <div className="contenedor">

          <p className="etiqueta">
            BELLA GLOW COSMETICS
          </p>

          <h1>Producto no encontrado</h1>

          <Link
            to="/productos"
            className="boton"
          >
            Volver al catálogo
          </Link>

        </div>
      </main>
    );
  }

  function agregar() {
    agregarAlCarrito(producto);

    setMensaje(
      `✓ ${producto.nombre} agregado al carrito`
    );

    setTimeout(() => {
      setMensaje("");
    }, 1800);
  }

  return (
    <main className="detalle-producto">

      <div className="contenedor">

        <Link
          to="/productos"
          className="volver"
        >
          ← Volver al catálogo
        </Link>

        <div className="detalle-producto-contenido">

          <div className="detalle-producto-imagen">

            <img
              src={producto.imagen}
              alt={producto.nombre}
            />

          </div>

          <div className="detalle-producto-info">

            <span className="categoria-mini">
              {producto.categoria}
            </span>

            <h1>
              {producto.nombre}
            </h1>

            <p className="detalle-descripcion">
              {producto.descripcion}
            </p>

            <p className="detalle-precio">
              ₡{producto.precio.toLocaleString("es-CR")}
            </p>

            <button
              type="button"
              className="boton"
              onClick={agregar}
            >
              🛍️ Agregar al carrito
            </button>

          </div>

        </div>

      </div>

      {mensaje && (
        <div
          className="aviso visible"
          role="status"
          aria-live="polite"
        >
          {mensaje}
        </div>
      )}

    </main>
  );
}

export default DetalleProducto;