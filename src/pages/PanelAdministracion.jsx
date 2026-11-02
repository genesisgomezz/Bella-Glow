import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function PanelAdministracion() {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === "ADMIN";

  return (
    <main className="seccion panel-administracion">
      <div className="contenedor">
        <p className="etiqueta">BELLA GLOW COSMETICS</p>

        <h1>Panel de administración</h1>

        <p className="panel-descripcion">
          Gestiona tu tienda desde un solo lugar.
        </p>

        <div className="admin-tarjetas">
          {/* PRODUCTOS: ADMIN y EMPLEADO */}
          <article className="admin-tarjeta">
            <div className="admin-icono">🛍️</div>
            <h2>Productos</h2>
            <p>
              Registra productos, modifica precios, actualiza
              existencias y administra las imágenes del catálogo.
            </p>

            <Link to="/administrar-productos" className="admin-boton">
              Gestionar productos →
            </Link>
          </article>

          {/* PERSONAL: SOLO ADMIN */}
          {esAdmin && (
            <article className="admin-tarjeta">
              <div className="admin-icono">👥</div>
              <h2>Personal</h2>
              <p>
                Crea cuentas de empleados y administradores
                para gestionar el acceso al sistema.
              </p>

              <Link to="/administrar-usuarios" className="admin-boton">
                Gestionar personal →
              </Link>
            </article>
          )}

          {/* PEDIDOS: ADMIN y EMPLEADO */}
          <article className="admin-tarjeta">
            <div className="admin-icono">📦</div>
            <h2>Pedidos</h2>
            <p>
              Consulta las compras de los clientes, revisa sus fechas,
              totales y estados.
            </p>

            <Link to="/administrar-pedidos" className="admin-boton">
              Gestionar pedidos →
            </Link>
          </article>

          {/* CLIENTES: ADMIN y EMPLEADO */}
          <article className="admin-tarjeta">
            <div className="admin-icono">👤</div>
            <h2>Clientes</h2>
            <p>
              Registra clientes, consulta sus datos y modifica su
              información. El administrador también puede activar
              o desactivar cuentas.
            </p>

            <Link to="/administrar-clientes" className="admin-boton">
              Gestionar clientes →
            </Link>
          </article>

          {/* TIENDA: ADMIN y EMPLEADO */}
          <article className="admin-tarjeta admin-tarjeta-tienda">
            <div className="admin-icono">💗</div>
            <h2>Tienda</h2>
            <p>
              Regresa al catálogo público de Bella Glow Cosmetics.
            </p>

            <Link to="/" className="admin-boton secundario-admin">
              Volver a la tienda →
            </Link>
          </article>
        </div>
      </div>
    </main>
  );
}

export default PanelAdministracion;