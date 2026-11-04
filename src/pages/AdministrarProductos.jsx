import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

const API_PRODUCTOS = "https://bella-glow-backend.onrender.com/api/productos";
const API_CATEGORIAS = "https://bella-glow-backend.onrender.com/api/categorias";
const API_BASE = "https://bella-glow-backend.onrender.com";

const formularioInicial = {
  nombre: "",
  categoria_id: "",
  descripcion: "",
  precio: "",
  imagen: "",
  stock: ""
};

function obtenerUrlImagen(imagen) {
  if (!imagen) return "/img/productos.svg";

  if (imagen.startsWith("/uploads/")) {
    return `${API_BASE}${imagen}`;
  }

  return imagen;
}

function AdministrarProductos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [productoEditando, setProductoEditando] = useState(null);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const [vistaPrevia, setVistaPrevia] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const { token } = useAuth();

  async function cargarDatos() {
    setCargando(true);

    try {
      const [respuestaProductos, respuestaCategorias] =
        await Promise.all([
          fetch(API_PRODUCTOS),
          fetch(API_CATEGORIAS)
        ]);

      if (!respuestaProductos.ok || !respuestaCategorias.ok) {
        throw new Error("No se pudieron cargar los datos.");
      }

      const datosProductos = await respuestaProductos.json();
      const datosCategorias = await respuestaCategorias.json();

      setProductos(datosProductos);
      setCategorias(datosCategorias);
    } catch (error) {
      console.error(error);
      setMensaje(
        "No se pudieron cargar los datos. Verifica el backend."
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  // Crear una vista previa cuando se selecciona una imagen
  useEffect(() => {
    if (!imagenSeleccionada) {
      setVistaPrevia("");
      return;
    }

    const urlTemporal = URL.createObjectURL(imagenSeleccionada);
    setVistaPrevia(urlTemporal);

    return () => URL.revokeObjectURL(urlTemporal);
  }, [imagenSeleccionada]);

  function manejarCambio(evento) {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value
    }));
  }

  function manejarSeleccionImagen(evento) {
    const archivo = evento.target.files?.[0];

    if (!archivo) return;

    const tiposPermitidos = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif"
    ];

    if (!tiposPermitidos.includes(archivo.type)) {
      setMensaje("Selecciona una imagen JPG, PNG, WEBP o GIF.");
      evento.target.value = "";
      return;
    }

    if (archivo.size > 5 * 1024 * 1024) {
      setMensaje("La imagen no puede superar los 5 MB.");
      evento.target.value = "";
      return;
    }

    setImagenSeleccionada(archivo);
    setMensaje("");
  }

  function limpiarFormulario() {
    setFormulario(formularioInicial);
    setProductoEditando(null);
    setImagenSeleccionada(null);

    const selector = document.getElementById("imagen-producto");
    if (selector) selector.value = "";
  }

  function editarProducto(producto) {
    setProductoEditando(producto.id);
    setImagenSeleccionada(null);

    setFormulario({
      nombre: producto.nombre,
      categoria_id: String(producto.categoria_id),
      descripcion: producto.descripcion ?? "",
      precio: String(producto.precio),
      imagen: producto.imagen ?? "",
      stock: String(producto.stock)
    });

    setMensaje("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  
  async function subirImagen() {
  const datosImagen = new FormData();
  datosImagen.append("imagen", imagenSeleccionada);

  const respuesta = await fetch(
    `${API_PRODUCTOS}/subir-imagen`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: datosImagen,
    }
  );

  const resultado = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      resultado.mensaje || "No se pudo subir la imagen."
    );
  }

  return resultado.imagen;
}

  async function guardarProducto(evento) {
    evento.preventDefault();
    setMensaje("");
    setGuardando(true);

    try {
      let rutaImagen = formulario.imagen;

      // Subir una imagen nueva solamente si se seleccionó
      if (imagenSeleccionada) {
        rutaImagen = await subirImagen();
      }

      const datos = {
        ...formulario,
        categoria_id: Number(formulario.categoria_id),
        precio: Number(formulario.precio),
        imagen: rutaImagen,
        stock: Number(formulario.stock)
      };

      const editando = productoEditando !== null;
      const url = editando
        ? `${API_PRODUCTOS}/${productoEditando}`
        : API_PRODUCTOS;
        
        const respuesta = await fetch(url, {
          method: editando ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(datos),
        });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.mensaje || "No se pudo guardar el producto."
        );
      }

      setMensaje(
        resultado.mensaje || "Producto guardado correctamente."
      );

      limpiarFormulario();
      await cargarDatos();
    } catch (error) {
      console.error(error);
      setMensaje(
        error.message || "Ocurrió un error al guardar."
      );
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarProducto(id) {
    const confirmar = window.confirm(
      "¿Deseas eliminar este producto del catálogo?"
    );

    if (!confirmar) return;

    setMensaje("");

    try {
      const respuesta = await fetch(`${API_PRODUCTOS}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });


      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.mensaje || "No se pudo eliminar el producto."
        );
      }

      setMensaje(
        resultado.mensaje || "Producto eliminado correctamente."
      );

      if (productoEditando === id) {
        limpiarFormulario();
      }

      await cargarDatos();
    } catch (error) {
      setMensaje(
        error.message || "Ocurrió un error al eliminar."
      );
    }
  }

  const imagenActual = obtenerUrlImagen(formulario.imagen);

  return (
    <main className="seccion pagina-admin-productos">
      <div className="contenedor">
        <p className="etiqueta">BELLA GLOW COSMETICS</p>
        <h1>Administrar productos</h1>
        <p>
          Registra, modifica y elimina productos de tu catálogo.
        </p>

        {mensaje && (
          <p role="status" aria-live="polite">
            {mensaje}
          </p>
        )}

        <form
          className="formulario-admin"
          onSubmit={guardarProducto}
        >
          <h2>
            {productoEditando !== null
              ? "Editar producto"
              : "Registrar producto"}
          </h2>

          <label>
            Nombre del producto
            <input
              name="nombre"
              value={formulario.nombre}
              onChange={manejarCambio}
              required
            />
          </label>

          <label>
            Categoría
            <select
              name="categoria_id"
              value={formulario.categoria_id}
              onChange={manejarCambio}
              required
            >
              <option value="">Selecciona una categoría</option>

              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </label>

          <label>
            Descripción
            <textarea
              name="descripcion"
              value={formulario.descripcion}
              onChange={manejarCambio}
              rows="3"
            />
          </label>

          <label>
            Precio en colones
            <input
              name="precio"
              type="number"
              min="0.01"
              step="0.01"
              value={formulario.precio}
              onChange={manejarCambio}
              required
            />
          </label>

          <label htmlFor="imagen-producto">
            Imagen del producto
          </label>

          <input
            id="imagen-producto"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={manejarSeleccionImagen}
          />

          <p>
            Formatos permitidos: JPG, PNG, WEBP y GIF. Máximo 5 MB.
          </p>

          {(vistaPrevia || formulario.imagen) && (
            <div className="vista-previa-imagen">
              <p>
                {vistaPrevia
                  ? "Vista previa de la nueva imagen"
                  : "Imagen actual"}
              </p>

              <img
                src={vistaPrevia || imagenActual}
                alt="Vista previa del producto"
                style={{
                  width: "180px",
                  height: "180px",
                  objectFit: "contain",
                  borderRadius: "8px"
                }}
              />
            </div>
          )}

          {productoEditando !== null && (
            <p>
              Si no seleccionas otra imagen, se conservará la actual.
            </p>
          )}

          <label>
            Cantidad en inventario
            <input
              name="stock"
              type="number"
              min="0"
              step="1"
              value={formulario.stock}
              onChange={manejarCambio}
              required
            />
          </label>

          <button type="submit" disabled={guardando}>
            {guardando
              ? "Guardando..."
              : productoEditando !== null
                ? "Guardar cambios"
                : "Registrar producto"}
          </button>

          {productoEditando !== null && (
            <button
              type="button"
              onClick={limpiarFormulario}
              disabled={guardando}
            >
              Cancelar edición
            </button>
          )}
        </form>

        <h2>Productos registrados</h2>

        {cargando ? (
          <p>Cargando productos...</p>
        ) : productos.length === 0 ? (
          <p>No hay productos activos.</p>
        ) : (
          <div className="grid-productos">
            {productos.map((producto) => (
              <article
                className="tarjeta producto-admin"
                key={producto.id}
              >
                <img
                  src={obtenerUrlImagen(producto.imagen)}
                  alt={producto.nombre}
                  onError={(evento) => {
                    evento.currentTarget.onerror = null;
                    evento.currentTarget.src = "/img/productos.svg";
                  }}
                />

                <h3>{producto.nombre}</h3>
                <p>{producto.categoria}</p>
                <p>
                  ₡{Number(producto.precio).toLocaleString("es-CR")}
                </p>
                <p>Stock: {producto.stock}</p>

                <button
                  type="button"
                  onClick={() => editarProducto(producto)}
                >
                  Editar
                </button>

                <button
                  type="button"
                  onClick={() => eliminarProducto(producto.id)}
                >
                  Eliminar
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default AdministrarProductos;
